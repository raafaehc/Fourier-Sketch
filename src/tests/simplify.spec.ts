import { describe, expect, it } from 'vitest';
import { simplifyPath } from '../lib/simplify';

const zigzag = [
  { x: 0, y: 0, t: 0 },
  { x: 50, y: 100, t: 1 },
  { x: 100, y: 0, t: 2 },
];

describe('simplifyPath', () => {
  it('keeps endpoints and removes redundant middle points when tolerance is high', () => {
    const result = simplifyPath(zigzag, 200);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(zigzag[0]);
    expect(result[1]).toEqual(zigzag[2]);
  });
});
