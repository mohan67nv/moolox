import { describe, it, expect } from 'vitest';
import { A11YConformanceGate, MinimalASTNodeForA11Y } from '../src/a11y/A11YConformanceGate';

describe('A11YConformanceGate: Automated Accessibility Conformance Gate (WCAG 2.2 AA) (A11Y-001)', () => {
  it('certifies a clean accessible AST tree as conforming to WCAG 2.2 AA', () => {
    const root: MinimalASTNodeForA11Y = {
      id: 'page-root',
      type: 'main',
      children: [
        {
          id: 'hero-title',
          type: 'h1',
          props: { children: 'Welcome to Dios AI Studio' },
        },
        {
          id: 'cta-btn',
          type: 'button',
          props: { 'aria-label': 'Start building your site now' },
        },
      ],
    };

    const audit = A11YConformanceGate.auditTree(root);
    expect(audit.passed).toBe(true);
    expect(audit.conformanceLevel).toBe('WCAG 2.2 AA');
    expect(audit.violationCount).toBe(0);
  });

  it('flags interactive elements lacking an accessible name (WCAG_MISSING_ACCESSIBLE_NAME)', () => {
    const root: MinimalASTNodeForA11Y = {
      id: 'root',
      type: 'div',
      children: [
        {
          id: 'bad-button',
          type: 'button',
          props: {}, // No label, no text, no alt
        },
      ],
    };

    const audit = A11YConformanceGate.auditTree(root);
    expect(audit.passed).toBe(false);
    expect(audit.violations.some((v) => v.ruleId === 'WCAG_MISSING_ACCESSIBLE_NAME')).toBe(true);
  });

  it('flags custom interactive widgets lacking tabIndex (WCAG_FOCUSABLE_MISSING_TABINDEX)', () => {
    const root: MinimalASTNodeForA11Y = {
      id: 'root',
      type: 'div',
      children: [
        {
          id: 'custom-switch',
          type: 'div',
          props: { role: 'button', 'aria-label': 'Toggle Dark Mode' }, // Missing tabIndex={0}
        },
      ],
    };

    const audit = A11YConformanceGate.auditTree(root);
    expect(audit.passed).toBe(false);
    expect(audit.violations.some((v) => v.ruleId === 'WCAG_FOCUSABLE_MISSING_TABINDEX')).toBe(true);
  });

  it('flags continuous animation when prefers-reduced-motion is enabled (WCAG_UNSAFE_MOTION)', () => {
    const root: MinimalASTNodeForA11Y = {
      id: 'root',
      type: 'div',
      props: {
        style: { animation: 'spin 2s infinite linear' },
      },
    };

    const audit = A11YConformanceGate.auditTree(root, true);
    expect(audit.violations.some((v) => v.ruleId === 'WCAG_UNSAFE_MOTION')).toBe(true);
    expect(audit.violations.find((v) => v.ruleId === 'WCAG_UNSAFE_MOTION')?.severity).toBe('warning');
  });

  it('calculates contrast ratio correctly using relative luminance formula', () => {
    const ratio = A11YConformanceGate.calculateContrastRatio(1.0, 0.0); // White vs Black
    expect(ratio).toBe(21);
  });
});
