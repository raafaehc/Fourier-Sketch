export type FourierCoefficients = {
  a0: number;
  an: number[];
  bn: number[];
};

export function computeFourierCoefficients(
  values: number[],
  harmonics: number,
): FourierCoefficients {
  const length = values.length;
  if (length === 0) {
    return { a0: 0, an: [], bn: [] };
  }
  const safeHarmonics = Math.max(1, Math.min(harmonics, 50));

  let sum = 0;
  for (let n = 0; n < length; n += 1) {
    sum += values[n];
  }
  const a0 = (2 / length) * sum;

  const an: number[] = new Array(safeHarmonics).fill(0);
  const bn: number[] = new Array(safeHarmonics).fill(0);

  for (let k = 1; k <= safeHarmonics; k += 1) {
    let c = 0;
    let s = 0;
    for (let n = 0; n < length; n += 1) {
      const x = (2 * Math.PI * n) / length;
      const value = values[n];
      c += value * Math.cos(k * x);
      s += value * Math.sin(k * x);
    }
    an[k - 1] = (2 / length) * c;
    bn[k - 1] = (2 / length) * s;
  }

  return { a0, an, bn };
}

export function evaluateFourierSeries(
  coeffs: FourierCoefficients,
  resolutionOrSamples?: number | number[],
): number[] {
  let length: number;
  if (Array.isArray(resolutionOrSamples)) {
    length = Math.max(resolutionOrSamples.length, 0);
  } else if (typeof resolutionOrSamples === 'number') {
    length = Math.max(resolutionOrSamples, 0);
  } else {
    length = 256;
  }

  if (length === 0) {
    return [];
  }

  const result: number[] = [];
  for (let n = 0; n < length; n += 1) {
    const x = (2 * Math.PI * n) / length;
    let value = coeffs.a0 / 2;
    for (let k = 1; k <= coeffs.an.length; k += 1) {
      const A = coeffs.an[k - 1] ?? 0;
      const B = coeffs.bn[k - 1] ?? 0;
      value += A * Math.cos(k * x) + B * Math.sin(k * x);
    }
    result.push(value);
  }
  return result;
}
