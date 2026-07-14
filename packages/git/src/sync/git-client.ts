/**
 * @moolox/git — GitHub Contents/Trees API Client (GIT-003)
 *
 * Low-level Git operations via the GitHub REST API for creating trees,
 * blobs, and commits atomically. Used by the push pipeline to avoid
 * git binary dependencies.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single file change to be committed to a GitHub repository. */
export interface FileChange {
  /** Relative file path within the repository */
  path: string;
  /** File content (UTF-8 string) */
  content: string;
  /** File mode: '100644' for regular files, '100755' for executable */
  mode?: '100644' | '100755';
}

/** Result of creating an atomic commit via GitHub's API. */
export interface CommitResult {
  /** Full commit SHA */
  sha: string;
  /** Commit message */
  message: string;
  /** Commit URL */
  htmlUrl: string;
  /** Tree SHA */
  treeSha: string;
  /** Number of files in the commit */
  filesCount: number;
}

// ---------------------------------------------------------------------------
// GitHub API Client
// ---------------------------------------------------------------------------

/**
 * Creates an atomic git commit with the given file changes using
 * the GitHub Trees/Commits API (no git binary required).
 *
 * Process:
 * 1. GET reference (branch HEAD) → current commit SHA
 * 2. GET commit → base tree SHA
 * 3. POST tree → new tree with file changes
 * 4. POST commit → commit object pointing to new tree
 * 5. PATCH reference → fast-forward branch HEAD
 *
 * @param token - GitHub installation access token
 * @param repoFullName - Full repository name (e.g., `org/repo`)
 * @param branch - Target branch (e.g., `main`)
 * @param files - Array of file changes to commit
 * @param message - Commit message
 * @param apiBaseUrl - GitHub API base URL
 * @returns Commit result with SHA and metadata
 */
export async function createAtomicCommit(
  token: string,
  repoFullName: string,
  branch: string,
  files: FileChange[],
  message: string,
  apiBaseUrl = 'https://api.github.com',
): Promise<CommitResult> {
  if (files.length === 0) {
    throw new Error('Cannot create an empty commit: no file changes provided.');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  const apiUrl = `${apiBaseUrl}/repos/${repoFullName}`;

  // 1. Get the current branch reference
  const refResponse = await fetch(`${apiUrl}/git/ref/heads/${branch}`, { headers });

  if (!refResponse.ok) {
    if (refResponse.status === 404) {
      throw new Error(
        `Branch "${branch}" not found in repository "${repoFullName}". ` +
          'Ensure the branch exists before pushing.',
      );
    }
    throw await createApiError(refResponse, 'fetching branch reference');
  }

  const refData = (await refResponse.json()) as {
    object: { sha: string };
  };
  const currentCommitSha = refData.object.sha;

  // 2. Get the current commit to find the base tree
  const commitResponse = await fetch(`${apiUrl}/git/commits/${currentCommitSha}`, { headers });
  if (!commitResponse.ok) {
    throw await createApiError(commitResponse, 'fetching current commit');
  }

  const commitData = (await commitResponse.json()) as {
    tree: { sha: string };
  };
  const baseTreeSha = commitData.tree.sha;

  // 3. Create the new tree with file changes
  const treeItems = files.map((file) => ({
    path: file.path,
    mode: file.mode ?? '100644',
    type: 'blob' as const,
    content: file.content,
  }));

  const treeResponse = await fetch(`${apiUrl}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems,
    }),
  });

  if (!treeResponse.ok) {
    throw await createApiError(treeResponse, 'creating git tree');
  }

  const treeData = (await treeResponse.json()) as { sha: string };

  // 4. Create the commit object
  const newCommitResponse = await fetch(`${apiUrl}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      tree: treeData.sha,
      parents: [currentCommitSha],
    }),
  });

  if (!newCommitResponse.ok) {
    throw await createApiError(newCommitResponse, 'creating commit');
  }

  const newCommitData = (await newCommitResponse.json()) as {
    sha: string;
    html_url: string;
  };

  // 5. Update the branch reference to point to the new commit
  const updateRefResponse = await fetch(`${apiUrl}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: newCommitData.sha,
      force: false, // No force push — safe fast-forward only
    }),
  });

  if (!updateRefResponse.ok) {
    // 422 indicates a non-fast-forward update (someone else pushed first)
    if (updateRefResponse.status === 422) {
      throw new Error(
        `Non-fast-forward update rejected for branch "${branch}" in "${repoFullName}". ` +
          'Another commit was pushed between our read and write. Retry after rebasing.',
      );
    }
    throw await createApiError(updateRefResponse, 'updating branch reference');
  }

  return {
    sha: newCommitData.sha,
    message,
    htmlUrl: newCommitData.html_url,
    treeSha: treeData.sha,
    filesCount: files.length,
  };
}

/**
 * Fetches file content from a GitHub repository.
 *
 * @param token - GitHub installation access token
 * @param repoFullName - Full repository name
 * @param filePath - Path to the file within the repository
 * @param branch - Branch to read from
 * @param apiBaseUrl - GitHub API base URL
 * @returns File content as UTF-8 string, or null if not found
 */
export async function getFileContent(
  token: string,
  repoFullName: string,
  filePath: string,
  branch: string,
  apiBaseUrl = 'https://api.github.com',
): Promise<string | null> {
  const response = await fetch(
    `${apiBaseUrl}/repos/${repoFullName}/contents/${filePath}?ref=${branch}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.raw+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw await createApiError(response, `fetching file "${filePath}"`);
  }

  return response.text();
}

/**
 * Lists files changed in a specific commit.
 *
 * @param token - GitHub installation access token
 * @param repoFullName - Full repository name
 * @param commitSha - Commit SHA to inspect
 * @param apiBaseUrl - GitHub API base URL
 * @returns Array of changed file paths with their change types
 */
export async function getCommitFiles(
  token: string,
  repoFullName: string,
  commitSha: string,
  apiBaseUrl = 'https://api.github.com',
): Promise<Array<{ path: string; status: string }>> {
  const response = await fetch(`${apiBaseUrl}/repos/${repoFullName}/commits/${commitSha}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw await createApiError(response, `fetching commit "${commitSha}"`);
  }

  const data = (await response.json()) as {
    files?: Array<{ filename: string; status: string }>;
  };

  return (data.files ?? []).map((f) => ({ path: f.filename, status: f.status }));
}

// ---------------------------------------------------------------------------
// Error Helper
// ---------------------------------------------------------------------------

async function createApiError(response: Response, context: string): Promise<Error> {
  const body = await response.text().catch(() => 'Unknown error');
  return new Error(`GitHub API error (${response.status}) while ${context}: ${body}`);
}
