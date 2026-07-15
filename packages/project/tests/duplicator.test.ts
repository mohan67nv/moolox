import { describe, it, expect } from 'vitest';
import { duplicateProjectTemplate, type ProjectTemplateSnapshot } from '../src/templates/duplicator';
import { type IASTNode, type TokenDocument } from '@moolox/types';

describe('PRJ-005: 1-Click Template Duplication Bridge', () => {
  const mockAST: IASTNode = {
    nodeId: 'node-original-root',
    type: 'section',
    props: { className: 'py-12 px-4' },
    children: [
      {
        nodeId: 'node-original-hero',
        type: 'div',
        props: { className: 'max-w-4xl mx-auto' },
        children: [
          {
            nodeId: 'node-original-heading',
            type: 'h1',
            props: { children: 'Moolox Platform' },
          },
        ],
      },
    ],
  };

  const mockTokenDoc: TokenDocument = {
    metadata: {
      version: '1.0.0',
      name: 'Default Dark',
      colorMode: 'dark',
      updatedAt: Date.now(),
    },
    tokens: {
      color: {
        bg: { primary: { value: '#0f172a', type: 'color' } },
        fg: { primary: { value: '#f8fafc', type: 'color' } },
      },
      space: {},
      font: {},
    },
  };

  const mockTemplate: ProjectTemplateSnapshot = {
    templateId: 'tmpl_001',
    name: 'SaaS Landing Page',
    astTree: mockAST,
    tokenDocument: mockTokenDoc,
  };

  it('should duplicate a project template in < 50ms with canonical node-{uuid} IDs', () => {
    const result = duplicateProjectTemplate(mockTemplate, 'ws_123');

    expect(result.durationMs).toBeLessThan(50);
    expect(result.projectId).toMatch(/^prj_[0-9a-f-]+$/i);
    expect(result.versionId).toMatch(/^ver_[0-9a-f-]+$/i);
    expect(result.workspaceId).toBe('ws_123');
    expect(result.name).toBe('SaaS Landing Page (Copy)');

    // Verify canonical node ID format
    expect(result.astTree.nodeId).toMatch(/^node-[0-9a-f-]+$/i);
    expect(result.astTree.nodeId).not.toBe('node-original-root');
    expect(result.astTree.children![0]!.nodeId).toMatch(/^node-[0-9a-f-]+$/i);
    expect(result.astTree.children![0]!.children![0]!.nodeId).toMatch(/^node-[0-9a-f-]+$/i);
  });

  it('should apply a chosen brand preset during duplication cleanly', () => {
    const result = duplicateProjectTemplate(mockTemplate, 'ws_999', {
      presetId: 'tokyo-neon',
      newProjectName: 'My Tokyo Neon Landing',
    });

    expect(result.name).toBe('My Tokyo Neon Landing');
    expect(result.tokenDocument.metadata.name).toBe('Tokyo Neon');
    expect((result.tokenDocument.tokens.color as any).accent.primary.value).toBe('#06b6d4'); // Tokyo Neon cyan
    expect(result.compilation.cssText).toContain('--dios-color-accent-primary: #06b6d4;');
  });
});
