import { describe, expect, it } from 'vitest';
import { resampleArcLength } from '../lib/resampleArcLength';
import type { DrawingPoint } from '../lib/drawing';

const samplePoints: DrawingPoint[] = [
  { x: 0, y: 100, t: 0 },
  { x: 50, y: 50, t: 1 },
  { x: 100, y: 100, t: 2 },
  { x: 50, y: 150, t: 3 },
  { x: 0, y: 100, t: 4 },
];

describe('resampleArcLength', () => {
  it('produces uniform samples even when path doubles back', () => {
    const { values, x } = resampleArcLength(samplePoints, {
      samples: 8,
      height: 200,
      width: 120,
    });
    expect(values).toHaveLength(8);
    expect(Math.max(...values)).toBeLessThanOrEqual(1);
    expect(Math.min(...values)).toBeGreaterThanOrEqual(-1);
    expect(x).toHaveLength(8);
  });

  it('handles degenerate paths gracefully', () => {
    const { values, x } = resampleArcLength(
      [{ x: 10, y: 10, t: 0 }],
      { samples: 5, height: 100, width: 50 },
    );
    expect(values.every((value) => value === values[0])).toBe(true);
    expect(x.every((value) => value === 10)).toBe(true);
  });
});
