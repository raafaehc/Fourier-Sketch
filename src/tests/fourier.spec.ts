import { describe, expect, it } from 'vitest';
import { computeFourierCoefficients, evaluateFourierSeries } from '../lib/fourier';

function generateSine(samples: number) {
  return Array.from({ length: samples }, (_, i) => {
    const u = i / (samples - 1 || 1);
    return Math.sin(2 * Math.PI * u);
  });
}

describe('fourier', () => {
  it('recovers the primary sine coefficient', () => {
    const values = generateSine(512);
    const coeffs = computeFourierCoefficients(values, 5);
    expect(coeffs.bn[0]).toBeCloseTo(1, 1);
    expect(coeffs.an[0]).toBeCloseTo(0, 1);
  });

  it('reconstruction matches original samples', () => {
    const values = generateSine(256);
    const coeffs = computeFourierCoefficients(values, 5);
    const reconstruction = evaluateFourierSeries(coeffs, 256);
    expect(reconstruction[50]).toBeCloseTo(values[50], 1);
  });
});
