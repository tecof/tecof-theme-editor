import { describe, it, expect } from 'vitest';
import { resizeStyleUpdate } from '../ResizeHandles';
import { compileStyles } from '../../style/compileStyles';
import { generateStyleCss } from '../../style/cssGenerator';
import type { NodeStyles } from '../../style/types';

describe('resizeStyleUpdate', () => {
  it('writes width for the east edge only', () => {
    const next = resizeStyleUpdate({}, 'e', 240.4, 180);
    expect(next.base).toEqual({ w: '[240px]' });
  });

  it('writes height for the south edge only', () => {
    const next = resizeStyleUpdate({}, 's', 240, 180.6);
    expect(next.base).toEqual({ h: '[181px]' });
  });

  it('writes both for the corner and preserves other base props', () => {
    const current: NodeStyles = { base: { p: '4' } };
    const next = resizeStyleUpdate(current, 'se', 320, 200);
    expect(next.base).toEqual({ p: '4', w: '[320px]', h: '[200px]' });
    // Immutability: the original object is untouched.
    expect(current.base).toEqual({ p: '4' });
  });

  it('compiles + generates real width/height CSS end to end', () => {
    const styles = resizeStyleUpdate({}, 'se', 240, 180);
    const classes = compileStyles(styles);
    expect(classes).toContain('w-[240px]');
    expect(classes).toContain('h-[180px]');
    const css = generateStyleCss(classes.split(' '));
    expect(css).toContain('width: 240px !important;');
    expect(css).toContain('height: 180px !important;');
  });
});
