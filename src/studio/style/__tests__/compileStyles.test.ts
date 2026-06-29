import { describe, it, expect } from 'vitest';
import { compileStyles, mergeClassName } from '../compileStyles';
import { getSafelist } from '../tokens';
import type { NodeStyles } from '../types';

describe('compileStyles', () => {
  it('returns empty string for empty/nullish input', () => {
    expect(compileStyles(null)).toBe('');
    expect(compileStyles(undefined)).toBe('');
    expect(compileStyles({})).toBe('');
  });

  it('compiles base layer tokens to classes', () => {
    const styles: NodeStyles = { base: { p: '4', bg: 'primary-600', radius: 'lg' } };
    expect(compileStyles(styles)).toBe('p-4 bg-primary-600 rounded-lg');
  });

  it('prefixes responsive breakpoints', () => {
    const styles: NodeStyles = { base: { p: '4' }, md: { p: '8' }, lg: { p: '12' } };
    expect(compileStyles(styles)).toBe('p-4 md:p-8 lg:p-12');
  });

  it('prefixes interaction states', () => {
    const styles: NodeStyles = { base: { bg: 'primary-600' }, states: { hover: { bg: 'primary-700' } } };
    expect(compileStyles(styles)).toBe('bg-primary-600 hover:bg-primary-700');
  });

  it('handles special-cased tokens (rounded/shadow base, display identity)', () => {
    expect(compileStyles({ base: { radius: 'md' } })).toBe('rounded');
    expect(compileStyles({ base: { shadow: 'md' } })).toBe('shadow');
    expect(compileStyles({ base: { display: 'flex', flexDir: 'col' } })).toBe('flex flex-col');
  });

  it('skips empty token values', () => {
    expect(compileStyles({ base: { p: '', bg: 'primary-600' } })).toBe('bg-primary-600');
  });

  it('mergeClassName joins author + style classes', () => {
    expect(mergeClassName('card', 'p-4 bg-primary-600')).toBe('card p-4 bg-primary-600');
    expect(mergeClassName(undefined, 'p-4')).toBe('p-4');
  });
});

describe('getSafelist', () => {
  it('includes base and prefixed variants of emitted classes', () => {
    const safelist = getSafelist();
    expect(safelist).toContain('bg-primary-600');
    expect(safelist).toContain('md:bg-primary-600');
    expect(safelist).toContain('hover:bg-primary-700');
    expect(safelist).toContain('p-4');
    expect(safelist).toContain('rounded'); // radius md special-case
    // No empty/null entries
    expect(safelist.every((c) => typeof c === 'string' && c.length > 0)).toBe(true);
  });
});
