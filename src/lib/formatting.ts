import type { FourierCoefficients } from './fourier';
import { type DomainRange } from './domain';

const formatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
  minimumFractionDigits: 0,
});

function fmt(value: number): string {
  const rounded = Number(formatter.format(value));
  if (Math.abs(rounded) < 1e-4) return '0';
  return rounded.toString();
}

export function formatSeriesText(coeffs: FourierCoefficients): string {
  const terms: string[] = [];
  if (coeffs.a0 !== 0) {
    terms.push(`${fmt(coeffs.a0 / 2)}`);
  }
  coeffs.an.forEach((value, index) => {
    const k = index + 1;
    if (value !== 0) {
      terms.push(`${fmt(value)}·cos(${k}·2πu)`);
    }
    const sineValue = coeffs.bn[index];
    if (sineValue !== 0) {
      terms.push(`${fmt(sineValue)}·sin(${k}·2πu)`);
    }
  });
  if (terms.length === 0) {
    return 'f(u) ≈ 0';
  }
  return `f(u) ≈ ${terms.join(' + ')}`;
}

export function buildDesmosExport(
  coeffs: FourierCoefficients,
  domain: DomainRange,
): string {
  const span = domain.b - domain.a;
  const amplitudeScale = span !== 0 ? span : 1;
  const xPrime = `(2π*(x - ${domain.a}))/(${span || 1})`;
  const parts: string[] = [];
  if (coeffs.a0 !== 0) {
    parts.push(`${fmt((coeffs.a0 / 2) * amplitudeScale)}`);
  }
  coeffs.an.forEach((value, index) => {
    const k = index + 1;
    if (value !== 0) {
      parts.push(`${fmt(value * amplitudeScale)}*cos(${k}*${xPrime})`);
    }
    const sineValue = coeffs.bn[index];
    if (sineValue !== 0) {
      parts.push(`${fmt(sineValue * amplitudeScale)}*sin(${k}*${xPrime})`);
    }
  });
  const rhs = parts.length === 0 ? '0' : parts.join(' + ');
  return `y = ${rhs}`;
}
