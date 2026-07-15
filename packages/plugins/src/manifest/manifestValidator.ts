/**
 * @moolox/plugins — Plugin Manifest & Lifecycle Validator (`PLG-001`)
 *
 * Validates plugin manifests (`id`, `version`, `name`, `author`, `permissions`, `entryPoint`, `hooks`)
 * against strict schema requirements before loading into the sandboxed execution boundary.
 *
 * Copyright © 2026 Moolox. All Rights Reserved.
 */

export type PluginPermission = 'read:ast' | 'write:ast' | 'read:tokens' | 'write:tokens' | 'network:fetch';

export type PluginHookType = 'onASTInspect' | 'onPropertyInspectorRender' | 'onTokenTransform' | 'onCanvasRender';

export interface PluginManifest {
  /** Unique plugin identifier (e.g., 'com.moolox.seo-audit') */
  id: string;
  /** Semver version string */
  version: string;
  /** Human-readable display name */
  name: string;
  /** Author name or organization */
  author: string;
  /** Brief description of capabilities */
  description: string;
  /** Requested permissions (`PLG-004`) */
  permissions: PluginPermission[];
  /** Relative bundle entry point (e.g., 'dist/index.js') */
  entryPoint: string;
  /** Declared hooks (`PLG-003`) */
  hooks: PluginHookType[];
  /** Optional minimum platform compatibility version */
  minPlatformVersion?: string;
  /** Whether the plugin is currently active (`is_active` flag) */
  isActive?: boolean;
}

export interface ManifestValidationResult {
  valid: boolean;
  manifest?: PluginManifest;
  errors: string[];
}

export class ManifestValidator {
  private static readonly ID_REGEX = /^[a-z0-9]+(\.[a-z0-9-]+){2,}$/;
  private static readonly VERSION_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+)?$/;
  private static readonly VALID_PERMISSIONS: Set<PluginPermission> = new Set([
    'read:ast',
    'write:ast',
    'read:tokens',
    'write:tokens',
    'network:fetch',
  ]);
  private static readonly VALID_HOOKS: Set<PluginHookType> = new Set([
    'onASTInspect',
    'onPropertyInspectorRender',
    'onTokenTransform',
    'onCanvasRender',
  ]);

  /**
   * Validates a raw JSON object against the strict `PluginManifest` schema (`PLG-001`).
   */
  static validate(raw: unknown): ManifestValidationResult {
    const errors: string[] = [];

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { valid: false, errors: ['Manifest must be a non-null JSON object.'] };
    }

    const obj = raw as Record<string, any>;

    // Validate ID
    if (typeof obj.id !== 'string' || !this.ID_REGEX.test(obj.id)) {
      errors.push(`Invalid plugin ID '${obj.id}'. Must be a dot-separated lowercase identifier (e.g., 'com.creator.plugin').`);
    }

    // Validate Version
    if (typeof obj.version !== 'string' || !this.VERSION_REGEX.test(obj.version)) {
      errors.push(`Invalid semver version '${obj.version}'. Must follow X.Y.Z format.`);
    }

    // Validate Name & Author
    if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
      errors.push('Manifest field "name" must be a non-empty string.');
    }
    if (typeof obj.author !== 'string' || obj.author.trim().length === 0) {
      errors.push('Manifest field "author" must be a non-empty string.');
    }
    if (typeof obj.description !== 'string') {
      errors.push('Manifest field "description" must be a string.');
    }

    // Validate Entry Point
    if (typeof obj.entryPoint !== 'string' || !obj.entryPoint.endsWith('.js')) {
      errors.push(`Invalid entry point '${obj.entryPoint}'. Must point to a compiled JavaScript bundle (.js).`);
    }

    // Validate Permissions
    if (!Array.isArray(obj.permissions)) {
      errors.push('Manifest field "permissions" must be an array of permission strings.');
    } else {
      for (const perm of obj.permissions) {
        if (!this.VALID_PERMISSIONS.has(perm)) {
          errors.push(`Unknown permission requested: '${perm}'. Valid permissions are: ${Array.from(this.VALID_PERMISSIONS).join(', ')}.`);
        }
      }
    }

    // Validate Hooks
    if (!Array.isArray(obj.hooks)) {
      errors.push('Manifest field "hooks" must be an array of hook names.');
    } else {
      for (const hook of obj.hooks) {
        if (!this.VALID_HOOKS.has(hook)) {
          errors.push(`Unknown hook requested: '${hook}'. Valid hooks are: ${Array.from(this.VALID_HOOKS).join(', ')}.`);
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const manifest: PluginManifest = {
      id: obj.id,
      version: obj.version,
      name: obj.name,
      author: obj.author,
      description: obj.description,
      permissions: [...obj.permissions],
      entryPoint: obj.entryPoint,
      hooks: [...obj.hooks],
      minPlatformVersion: typeof obj.minPlatformVersion === 'string' ? obj.minPlatformVersion : 'v1.0.0',
      isActive: obj.isActive !== false,
    };

    return { valid: true, manifest, errors: [] };
  }
}
