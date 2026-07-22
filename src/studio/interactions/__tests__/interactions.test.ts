import { describe, it, expect } from 'vitest';
import { collectInteractionRegistry, interactionNodeClasses, validInteractions } from '../registry';
import { planInteraction } from '../runtime';
import type { Interaction } from '../types';

const ix = (over: Partial<Interaction>): Interaction => ({
  id: 'r',
  trigger: 'click',
  action: 'scrollTo',
  ...over,
});

describe('collectInteractionRegistry', () => {
  it('collects interactions from content and zones, skipping empty/invalid', () => {
    const doc = {
      content: [
        { props: { id: 'A', _interactions: [ix({ action: 'scrollTo', target: 'B' })] } },
        { props: { id: 'C' } }, // no interactions
      ],
      zones: {
        'A:slot': [
          { props: { id: 'D', _interactions: [ix({ trigger: 'hover', action: 'show', target: 'E' })] } },
          { props: { id: 'F', _interactions: 'not-an-array' } }, // invalid → skipped
        ],
      },
    };
    const reg = collectInteractionRegistry(doc as never);
    expect(Object.keys(reg).sort()).toEqual(['A', 'D']);
    expect(reg.A[0].action).toBe('scrollTo');
    expect(reg.D[0].trigger).toBe('hover');
  });

  it('returns {} for null / empty documents', () => {
    expect(collectInteractionRegistry(null)).toEqual({});
    expect(collectInteractionRegistry({})).toEqual({});
  });

  it('validInteractions keeps only well-formed rows', () => {
    expect(validInteractions('x')).toEqual([]);
    expect(validInteractions([{ id: '1' }, ix({})])).toHaveLength(1);
  });
});

describe('interactionNodeClasses', () => {
  it('marks every node with a stable anchor class', () => {
    expect(interactionNodeClasses({ id: 'Hero-1' }, { editing: false })).toBe('tecof-node-Hero-1');
  });

  it('adds tecof-fx to interaction sources', () => {
    const cls = interactionNodeClasses({ id: 'B', _interactions: [ix({})] }, { editing: false }).split(' ');
    expect(cls).toContain('tecof-node-B');
    expect(cls).toContain('tecof-fx');
  });

  it('hides start-hidden nodes at runtime, keeps them visible (dashed) in edit mode', () => {
    expect(interactionNodeClasses({ id: 'P', _startHidden: true }, { editing: false })).toContain('tecof-fx-hidden');
    expect(interactionNodeClasses({ id: 'P', _startHidden: true }, { editing: true })).toContain('tecof-fx-starthidden');
  });

  it('returns empty for a node with no id', () => {
    expect(interactionNodeClasses({}, { editing: false })).toBe('');
  });
});

describe('planInteraction (pure policy)', () => {
  it('scrollTo fires on click and hover-enter, not on hover-leave', () => {
    expect(planInteraction(ix({ action: 'scrollTo' }), 'click')).toEqual({ op: 'scroll' });
    expect(planInteraction(ix({ action: 'scrollTo' }), 'enter')).toEqual({ op: 'scroll' });
    expect(planInteraction(ix({ action: 'scrollTo' }), 'leave')).toBeNull();
  });

  it('toggleClass: click toggles; hover sets on-enter and off-leave', () => {
    const it = ix({ action: 'toggleClass', className: 'is-open' });
    expect(planInteraction(it, 'click')).toEqual({ op: 'toggleClass', className: 'is-open' });
    expect(planInteraction(it, 'enter')).toEqual({ op: 'setClass', className: 'is-open', on: true });
    expect(planInteraction(it, 'leave')).toEqual({ op: 'setClass', className: 'is-open', on: false });
    expect(planInteraction(ix({ action: 'toggleClass' }), 'click')).toBeNull(); // no className
  });

  it('show reveals; hover show is visible-while-hovering', () => {
    expect(planInteraction(ix({ action: 'show' }), 'click')).toEqual({ op: 'setHidden', hidden: false });
    expect(planInteraction(ix({ action: 'show' }), 'enter')).toEqual({ op: 'setHidden', hidden: false });
    expect(planInteraction(ix({ action: 'show' }), 'leave')).toEqual({ op: 'setHidden', hidden: true });
  });

  it('hide conceals; hover hide is hidden-while-hovering', () => {
    expect(planInteraction(ix({ action: 'hide' }), 'click')).toEqual({ op: 'setHidden', hidden: true });
    expect(planInteraction(ix({ action: 'hide' }), 'enter')).toEqual({ op: 'setHidden', hidden: true });
    expect(planInteraction(ix({ action: 'hide' }), 'leave')).toEqual({ op: 'setHidden', hidden: false });
  });

  it('toggle flips on click, behaves like show on hover', () => {
    expect(planInteraction(ix({ action: 'toggle' }), 'click')).toEqual({ op: 'toggleHidden' });
    expect(planInteraction(ix({ action: 'toggle' }), 'enter')).toEqual({ op: 'setHidden', hidden: false });
    expect(planInteraction(ix({ action: 'toggle' }), 'leave')).toEqual({ op: 'setHidden', hidden: true });
  });
});
