// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { sliderKeyTarget } from '../color/sliderKeys';

const o = { min: 0, max: 100, step: 1, shiftStep: 10, page: 25 };

describe('sliderKeyTarget', () => {
  it('ok tuşları ±step', () => {
    expect(sliderKeyTarget('ArrowRight', false, 50, o)).toBe(51);
    expect(sliderKeyTarget('ArrowUp', false, 50, o)).toBe(51);
    expect(sliderKeyTarget('ArrowLeft', false, 50, o)).toBe(49);
    expect(sliderKeyTarget('ArrowDown', false, 50, o)).toBe(49);
  });
  it('Shift ±shiftStep', () => {
    expect(sliderKeyTarget('ArrowRight', true, 50, o)).toBe(60);
    expect(sliderKeyTarget('ArrowLeft', true, 50, o)).toBe(40);
  });
  it('PageUp/PageDown ±page', () => {
    expect(sliderKeyTarget('PageUp', false, 50, o)).toBe(75);
    expect(sliderKeyTarget('PageDown', false, 50, o)).toBe(25);
  });
  it('Home/End', () => {
    expect(sliderKeyTarget('Home', false, 50, o)).toBe(0);
    expect(sliderKeyTarget('End', false, 50, o)).toBe(100);
  });
  it('sınırda kırpılır', () => {
    expect(sliderKeyTarget('ArrowRight', true, 95, o)).toBe(100);
    expect(sliderKeyTarget('ArrowLeft', true, 5, o)).toBe(0);
    expect(sliderKeyTarget('PageUp', false, 90, o)).toBe(100);
  });
  it('varsayılanlar: step 1, shiftStep 10, page = shiftStep', () => {
    const d = { min: 0, max: 100 };
    expect(sliderKeyTarget('ArrowRight', false, 1, d)).toBe(2);
    expect(sliderKeyTarget('ArrowRight', true, 1, d)).toBe(11);
    expect(sliderKeyTarget('PageUp', false, 1, d)).toBe(11);
  });
  it('wrap: 359 → ArrowRight → 0, 0 → ArrowLeft → 359', () => {
    const hue = { min: 0, max: 359, step: 1, shiftStep: 10, page: 30, wrap: true };
    expect(sliderKeyTarget('ArrowRight', false, 359, hue)).toBe(0);
    expect(sliderKeyTarget('ArrowLeft', false, 0, hue)).toBe(359);
    expect(sliderKeyTarget('ArrowRight', true, 355, hue)).toBe(5);
    expect(sliderKeyTarget('End', false, 10, hue)).toBe(359);
    expect(sliderKeyTarget('Home', false, 10, hue)).toBe(0);
  });
  it('ilgisiz tuş → null', () => {
    expect(sliderKeyTarget('a', false, 50, o)).toBeNull();
    expect(sliderKeyTarget('Enter', false, 50, o)).toBeNull();
    expect(sliderKeyTarget('Tab', false, 50, o)).toBeNull();
  });
});
