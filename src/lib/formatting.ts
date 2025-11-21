import type { FourierCoefficients } from './fourier';
import { type DomainRange } from './domain';

function fmt(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) < 1e-12) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e4 || abs < 1e-6) {
    return value.toExponential(6);
  }
  return value.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
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
  const { a0, an, bn } = coeffs;
  const a = domain.a;
  const b = domain.b;
  const maxTerms = Math.max(an.length, bn.length);

  const parts: string[] = [];

  if (Math.abs(a0 / 2) > 0) {
    parts.push(`${fmt(a0 / 2)}`);
  }

  for (let k = 1; k <= maxTerms; k += 1) {
    const A = an[k - 1] ?? 0;
    const B = bn[k - 1] ?? 0;
    if (A !== 0) {
      parts.push(`${fmt(A)}*cos(${k}*2π*(x-${a})/(${b}-${a}))`);
    }
    if (B !== 0) {
      parts.push(`${fmt(B)}*sin(${k}*2π*(x-${a})/(${b}-${a}))`);
    }
  }

  const rhsBase = parts.length ? parts.join(' + ') : '0';
  const rhs = rhsBase.replace(/\+ -/g, '- ');
  return `y = ${rhs}`;
}
