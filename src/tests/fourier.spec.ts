import { describe, expect, it } from 'vitest';
import { applyLanczosSigma, computeFourierCoefficients, evaluateFourierSeries } from '../lib/fourier';

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
    const tapered = applyLanczosSigma(coeffs);
    const reconstruction = evaluateFourierSeries(tapered, 256);
    expect(reconstruction[50]).toBeCloseTo(values[50], 1);
  });

  it('tapers high-order harmonics to curb ringing', () => {
    const samples = 256;
    const square = Array.from({ length: samples }, (_, i) => (i < samples / 2 ? 1 : -1));
    const coeffs = computeFourierCoefficients(square, 9);
    const tapered = applyLanczosSigma(coeffs);
    const lastIndex = coeffs.bn.length - 1;

    expect(Math.abs(tapered.bn[lastIndex])).toBeLessThan(Math.abs(coeffs.bn[lastIndex]));
    expect(Math.abs(tapered.bn[0])).toBeGreaterThan(0.7 * Math.abs(coeffs.bn[0]));
  });
});
