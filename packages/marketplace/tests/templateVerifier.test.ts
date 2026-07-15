import { describe, it, expect } from 'vitest';
import { TemplateVerificationEngine } from '../src/verification/templateVerifier';
import { type IASTNode } from '@moolox/types';

describe('TemplateVerificationEngine (MKT-003)', () => {
  it('certifies clean, well-formed AST templates adhering to canonical rules', () => {
    const cleanAST: IASTNode = {
      nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
      type: 'HeroSpec',
      props: { title: 'Clean SaaS Landing' },
      styles: { 'bg-color': 'colors.bg.main', 'text-color': 'colors.text.primary' },
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('Clean SaaS', cleanAST);
    expect(audit.verified).toBe(true);
    expect(audit.securityErrors).toHaveLength(0);
    expect(audit.structureErrors).toHaveLength(0);
  });

  it('rejects malformed node IDs that violate canonical node-{uuid} rules', () => {
    const badIDAST: IASTNode = {
      nodeId: 'bad-ad-hoc-id',
      type: 'Container',
      props: {},
      styles: {},
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('Bad ID Template', badIDAST);
    expect(audit.verified).toBe(false);
    expect(audit.structureErrors[0]).toContain("violates canonical 'node-{uuid}' ID structure");
  });

  it('rejects XSS script injection vectors and dangerous inline attributes', () => {
    const xssAST: IASTNode = {
      nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
      type: 'Button',
      props: { onClick: 'alert(document.cookie)', href: 'javascript:steal()' },
      styles: {},
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('XSS Template', xssAST);
    expect(audit.verified).toBe(false);
    expect(audit.securityErrors.some((e) => e.includes('forbidden script attribute'))).toBe(true);
    expect(audit.securityErrors.some((e) => e.includes("dangerous 'javascript:' protocol"))).toBe(true);
  });

  it('automatically sanitizes raw hex values via Euclidean mapping (TKN-003 Zero-Hex Law)', () => {
    const hexAST: IASTNode = {
      nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
      type: 'Card',
      props: {},
      styles: { 'card-bg': '#0f172a' },
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('Hex Template', hexAST);
    expect(audit.hexViolationsSanitized).toBeGreaterThan(0);
    expect(typeof hexAST.styles?.['card-bg']).toBe('string');
  });

  it('rejects prototype pollution keys across props, styles, and tokens (MKT-004)', () => {
    const protoAST: IASTNode = {
      nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
      type: 'Box',
      props: { '__proto__': { isAdmin: true } } as any,
      styles: { 'constructor': 'malicious' } as any,
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('Proto Template', protoAST);
    expect(audit.verified).toBe(false);
    expect(audit.securityErrors.some((e) => e.includes('prototype pollution key'))).toBe(true);
  });

  it('rejects DOM clobbering attempts via id or name props targeting global document/window (MKT-004)', () => {
    const clobberAST: IASTNode = {
      nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
      type: 'Input',
      props: { id: 'location', name: 'document' },
      styles: {},
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('Clobber Template', clobberAST);
    expect(audit.verified).toBe(false);
    expect(audit.securityErrors.some((e) => e.includes('attempts DOM clobbering'))).toBe(true);
  });

  it('rejects <script> node elements directly embedded in AST tree (MKT-004)', () => {
    const scriptAST: IASTNode = {
      nodeId: 'node-12345678-abcd-1234-abcd-1234567890ab',
      type: 'script',
      props: { src: 'https://evil.com/payload.js' },
      styles: {},
      children: [],
    };

    const audit = TemplateVerificationEngine.verifyTemplate('Script Template', scriptAST);
    expect(audit.verified).toBe(false);
    expect(audit.securityErrors.some((e) => e.includes("forbidden type 'script'"))).toBe(true);
  });
});


