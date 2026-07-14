/**
 * @moolox/git — Repository Provisioning & Project Linking (GIT-001)
 *
 * Associates Moolox projects with GitHub repositories for bidirectional
 * synchronization. Supports repository creation (via GitHub API), linking
 * to existing repositories, unlinking, and listing available repos.
 *
 * All operations require RBAC `MANAGE_PROJECT` permission verified via
 * the `@moolox/auth` workspace access guard.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

import { eq, and } from 'drizzle-orm';
import {
  type Database,
  projects,
  githubInstallations,
  type Project,
} from '@moolox/db';
import { verifyWorkspaceAccess, ForbiddenError } from '@moolox/auth';
import { getInstallationAccessToken, type GitHubAppConfig } from './oauth';

// ---------------------------------------------------------------------------
// Repository Discovery
// ---------------------------------------------------------------------------

/** Minimal repository descriptor returned from GitHub's API. */
export interface GitHubRepository {
  /** GitHub's numeric repository ID */
  id: number;
  /** Full repository name (e.g., `org/repo-name`) */
  fullName: string;
  /** Short repository name */
  name: string;
  /** Whether the repository is private */
  isPrivate: boolean;
  /** Default branch name */
  defaultBranch: string;
  /** Repository description */
  description: string | null;
  /** HTML URL */
  htmlUrl: string;
}

/**
 * Lists repositories accessible to a GitHub App installation.
 *
 * Uses the installation access token to call:
 * GET /installation/repositories
 */
export async function listInstallationRepositories(
  db: Database,
  installationId: string,
  page = 1,
  perPage = 30,
  config?: GitHubAppConfig,
): Promise<{ repositories: GitHubRepository[]; totalCount: number }> {
  const token = await getInstallationAccessToken(db, installationId, config);
  const apiBaseUrl = config?.apiBaseUrl ?? 'https://api.github.com';

  const response = await fetch(
    `${apiBaseUrl}/installation/repositories?page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(`GitHub API error (${response.status}) listing repositories: ${errorBody}`);
  }

  const data = (await response.json()) as {
    total_count: number;
    repositories: Array<{
      id: number;
      full_name: string;
      name: string;
      private: boolean;
      default_branch: string;
      description: string | null;
      html_url: string;
    }>;
  };

  return {
    totalCount: data.total_count,
    repositories: data.repositories.map((repo) => ({
      id: repo.id,
      fullName: repo.full_name,
      name: repo.name,
      isPrivate: repo.private,
      defaultBranch: repo.default_branch,
      description: repo.description,
      htmlUrl: repo.html_url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Repository Linking
// ---------------------------------------------------------------------------

/** Input for linking a project to a GitHub repository. */
export interface LinkRepositoryInput {
  /** Moolox project ID to link */
  projectId: string;
  /** Internal installation ID (from github_installations.id) */
  installationId: string;
  /** Full GitHub repository name (e.g., `org/repo-name`) */
  githubFullName: string;
  /** GitHub's numeric repository ID */
  githubRepoId: number;
  /** Target branch for sync (defaults to `main`) */
  branch?: string;
  /** Base path within the repo for export (defaults to root) */
  basePath?: string;
}

/** Result of a repository linking operation. */
export interface LinkRepositoryResult {
  /** Updated project record */
  project: Project;
  /** Whether this replaced an existing link */
  wasRelinked: boolean;
}

/**
 * Links a Moolox project to a GitHub repository.
 *
 * 1. Verifies the actor has MANAGE_PROJECT permission on the project's workspace.
 * 2. Validates the installation belongs to the same workspace.
 * 3. Persists the repository URL and branch on the project record.
 *
 * @param db - Database client
 * @param actorUserId - User performing the action (RBAC checked)
 * @param input - Repository link configuration
 * @returns The updated project and whether it was a re-link
 */
export async function linkRepository(
  db: Database,
  actorUserId: string,
  input: LinkRepositoryInput,
): Promise<LinkRepositoryResult> {
  // 1. Load project and verify it exists
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, input.projectId),
  });

  if (!project) {
    throw new Error(`Project "${input.projectId}" not found.`);
  }

  // 2. Verify actor has MANAGE_PROJECT permission
  await verifyWorkspaceAccess(db, actorUserId, project.workspaceId, 'MANAGE_PROJECT');

  // 3. Verify the installation belongs to the same workspace
  const installation = await db.query.githubInstallations.findFirst({
    where: and(
      eq(githubInstallations.id, input.installationId),
      eq(githubInstallations.workspaceId, project.workspaceId),
    ),
  });

  if (!installation) {
    throw new ForbiddenError(
      'The specified GitHub installation does not belong to this workspace, ' +
        'or the installation does not exist.',
    );
  }

  if (installation.status !== 'active') {
    throw new Error(
      `GitHub installation is ${installation.status}. Only active installations can be linked.`,
    );
  }

  // 4. Update project with GitHub repository link
  const wasRelinked = Boolean(project.githubRepoUrl);
  const branch = input.branch ?? 'main';
  const githubUrl = `https://github.com/${input.githubFullName}`;

  const [updated] = await db
    .update(projects)
    .set({
      githubRepoUrl: githubUrl,
      githubBranch: branch,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, input.projectId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to update project "${input.projectId}" with repository link.`);
  }

  return { project: updated, wasRelinked };
}

// ---------------------------------------------------------------------------
// Repository Unlinking
// ---------------------------------------------------------------------------

/**
 * Unlinks a Moolox project from its GitHub repository.
 * Does not delete the installation itself — only clears the project's repo reference.
 *
 * @param db - Database client
 * @param actorUserId - User performing the action (RBAC checked)
 * @param projectId - Project to unlink
 * @returns The updated project
 */
export async function unlinkRepository(
  db: Database,
  actorUserId: string,
  projectId: string,
): Promise<Project> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new Error(`Project "${projectId}" not found.`);
  }

  await verifyWorkspaceAccess(db, actorUserId, project.workspaceId, 'MANAGE_PROJECT');

  if (!project.githubRepoUrl) {
    return project; // Already unlinked
  }

  const [updated] = await db
    .update(projects)
    .set({
      githubRepoUrl: null,
      githubBranch: 'main',
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) {
    throw new Error(`Failed to unlink repository from project "${projectId}".`);
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Repository Status Query
// ---------------------------------------------------------------------------

/**
 * Retrieves the GitHub repository link status for a project.
 * Returns null if the project has no linked repository.
 */
export async function getRepositoryLinkStatus(
  db: Database,
  projectId: string,
): Promise<{
  isLinked: boolean;
  githubRepoUrl: string | null;
  branch: string;
  installationStatus: string | null;
} | null> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    return null;
  }

  if (!project.githubRepoUrl) {
    return {
      isLinked: false,
      githubRepoUrl: null,
      branch: project.githubBranch ?? 'main',
      installationStatus: null,
    };
  }

  // Find the installation associated with this workspace
  const installation = await db.query.githubInstallations.findFirst({
    where: and(
      eq(githubInstallations.workspaceId, project.workspaceId),
      eq(githubInstallations.status, 'active'),
    ),
  });

  return {
    isLinked: true,
    githubRepoUrl: project.githubRepoUrl,
    branch: project.githubBranch ?? 'main',
    installationStatus: installation?.status ?? null,
  };
}
