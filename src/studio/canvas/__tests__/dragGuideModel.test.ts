import { describe, it, expect } from 'vitest';
import { computeDragGuides, pickNeighbourEdges, type GuideRect } from '../dragGuideModel';

const container: GuideRect = { top: 100, left: 50, width: 600, height: 800 };

describe('computeDragGuides — column flow (axis y)', () => {
  it('spans the container with a horizontal insertion line + vertical edges', () => {
    const m = computeDragGuides({ axis: 'y', lineAt: 300, container, prevEdge: 276, nextEdge: 324 });
    expect(m.line).toEqual({ top: 299, left: 50, width: 600, height: 2 });
    expect(m.edges).toHaveLength(2);
    // Vertical hairlines at the container's left/right, full height.
    expect(m.edges[0]).toMatchObject({ left: 50, top: 100, width: 1, height: 800 });
    expect(m.edges[1]).toMatchObject({ left: 649, top: 100, width: 1, height: 800 });
  });

  it('emits a distance badge per neighbour, centred in each gap', () => {
    const m = computeDragGuides({ axis: 'y', lineAt: 300, container, prevEdge: 276, nextEdge: 332 });
    expect(m.badges).toEqual([
      { value: 24, left: 350, top: 288 }, // 300-276 above, centred at (276+300)/2
      { value: 32, left: 350, top: 316 }, // 332-300 below
    ]);
  });

  it('falls back to the container edges when there is no neighbour', () => {
    const m = computeDragGuides({ axis: 'y', lineAt: 140, container, prevEdge: null, nextEdge: null });
    // prev gap = 140-100 (container top), next gap = 900-140 (container bottom).
    expect(m.badges.map((b) => b.value)).toEqual([40, 760]);
  });

  it('drops ~0 gaps (the line sitting on the target edge itself)', () => {
    const m = computeDragGuides({ axis: 'y', lineAt: 300, container, prevEdge: 299.5, nextEdge: 340 });
    expect(m.badges.map((b) => b.value)).toEqual([40]);
  });
});

describe('computeDragGuides — row flow (axis x)', () => {
  it('mirrors everything: vertical line, horizontal edges, horizontal gaps', () => {
    const m = computeDragGuides({ axis: 'x', lineAt: 200, container, prevEdge: 184, nextEdge: 240 });
    expect(m.line).toEqual({ top: 100, left: 199, width: 2, height: 800 });
    expect(m.edges[0]).toMatchObject({ top: 100, left: 50, width: 600, height: 1 });
    expect(m.edges[1]).toMatchObject({ top: 899, left: 50, width: 600, height: 1 });
    expect(m.badges).toEqual([
      { value: 16, top: 500, left: 192 },
      { value: 40, top: 500, left: 220 },
    ]);
  });
});

describe('pickNeighbourEdges', () => {
  const sib = (top: number, height: number): GuideRect => ({ top, left: 0, width: 100, height });

  it('picks the nearest facing edges around the line', () => {
    const siblings = [sib(100, 50), sib(180, 40), sib(260, 40)]; // ends: 150, 220, 300
    expect(pickNeighbourEdges('y', 240, siblings)).toEqual({ prevEdge: 220, nextEdge: 260 });
  });

  it('tolerates the line sitting exactly on a sibling edge', () => {
    const siblings = [sib(100, 50), sib(180, 40)];
    // Line at 180 = second sibling's top: it becomes nextEdge, first's end prevEdge.
    expect(pickNeighbourEdges('y', 180, siblings)).toEqual({ prevEdge: 150, nextEdge: 180 });
  });

  it('returns nulls at the list edges', () => {
    const siblings = [sib(200, 50)];
    expect(pickNeighbourEdges('y', 100, siblings)).toEqual({ prevEdge: null, nextEdge: 200 });
    expect(pickNeighbourEdges('y', 400, siblings)).toEqual({ prevEdge: 250, nextEdge: null });
  });

  it('works on the x axis using left/right edges', () => {
    const siblings: GuideRect[] = [
      { top: 0, left: 100, width: 80, height: 50 },
      { top: 0, left: 220, width: 80, height: 50 },
    ];
    expect(pickNeighbourEdges('x', 200, siblings)).toEqual({ prevEdge: 180, nextEdge: 220 });
  });
});
