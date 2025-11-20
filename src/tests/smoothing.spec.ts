import { describe, expect, it } from 'vitest';
import { smoothPath } from '../lib/smoothing';

const points = [
  { x: 0, y: 0, t: 0 },
  { x: 50, y: 30, t: 1 },
  { x: 100, y: 0, t: 2 },
];

describe('smoothPath', () => {
  it('returns more points when smoothing is applied', () => {
    const result = smoothPath(points, 3);
    expect(result.length).toBeGreaterThan(points.length);
  });
});
