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
  const sampleSpan = Math.max(length - 1, 1);
  const delta = 1 / sampleSpan;
  const weight = (index: number) => {
    if (length === 1) return 1;
    return index === 0 || index === length - 1 ? 0.5 : 1;
  };
  const safeHarmonics = Math.max(1, Math.min(harmonics, 50));
  const weightedSum = values.reduce(
    (sum, value, index) => sum + value * weight(index),
    0,
  );
  const a0 = 2 * delta * weightedSum;
  const an: number[] = [];
  const bn: number[] = [];
  for (let k = 1; k <= safeHarmonics; k += 1) {
    let sumCos = 0;
    let sumSin = 0;
    for (let n = 0; n < length; n += 1) {
      const u = sampleSpan === 0 ? 0 : n / sampleSpan;
      const w = weight(n);
      const angle = 2 * Math.PI * k * u;
      const value = values[n];
      sumCos += w * value * Math.cos(angle);
      sumSin += w * value * Math.sin(angle);
    }
    const factor = 2 * delta;
    an.push(factor * sumCos);
    bn.push(factor * sumSin);
  }
  return { a0, an, bn };
}

export function evaluateFourierSeries(
  coeffs: FourierCoefficients,
  resolutionOrSamples?: number | number[],
): number[] {
  let uSamples: number[];
  if (Array.isArray(resolutionOrSamples)) {
    uSamples = resolutionOrSamples;
  } else if (typeof resolutionOrSamples === 'number') {
    const N = Math.max(resolutionOrSamples, 2);
    uSamples = Array.from({ length: N }, (_, i) =>
      N === 1 ? 0 : i / (N - 1),
    );
  } else {
    const fallback = 256;
    uSamples = Array.from({ length: fallback }, (_, i) => i / (fallback - 1));
  }

  return uSamples.map((uSample) => {
    const u = Number.isFinite(uSample) ? uSample : 0;
    let value = coeffs.a0 / 2;
    for (let k = 1; k <= coeffs.an.length; k += 1) {
      const angle = 2 * Math.PI * k * u;
      value += coeffs.an[k - 1] * Math.cos(angle);
      if (k - 1 < coeffs.bn.length) {
        value += coeffs.bn[k - 1] * Math.sin(angle);
      }
    }
    return value;
  });
}
