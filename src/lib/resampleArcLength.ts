import { canvasYToValue } from './drawing';
import type { DrawingPoint } from './drawing';

export type ResampleOptions = {
  samples: number;
  height: number;
  width: number;
};

export type ResampleResult = {
  u: number[];
  values: number[];
  x: number[];
};

function computeArcLength(points: DrawingPoint[]): number[] {
  const s = new Array(points.length).fill(0);
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    s[i] = s[i - 1] + Math.hypot(dx, dy);
  }
  return s;
}

function lowerBound(values: number[], target: number): number {
  let low = 0;
  let high = values.length - 1;
  let answer = values.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (values[mid] >= target) {
      answer = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return answer;
}

export function resampleArcLength(
  points: DrawingPoint[],
  options: ResampleOptions,
): ResampleResult {
  const samples = Math.max(2, Math.floor(options.samples));
  const uniformU = Array.from(
    { length: samples },
    (_, i) => (samples === 1 ? 0 : i / (samples - 1)),
  );
  const defaultX = uniformU.map((u) => u * Math.max(options.width - 1, 1));
  if (points.length === 0) {
    return { u: uniformU, values: new Array(samples).fill(0), x: defaultX };
  }
  if (points.length === 1) {
    const value = canvasYToValue(points[0].y, options.height);
    const x = new Array(samples).fill(points[0].x);
    return { u: uniformU, values: new Array(samples).fill(value), x };
  }
  const s = computeArcLength(points);
  const total = s[s.length - 1];
  const normalized = total === 0
    ? points.map((_, idx) => idx / (points.length - 1))
    : s.map((len) => len / total);

  const values: number[] = [];
  const xs: number[] = [];
  uniformU.forEach((target) => {
    let hi = lowerBound(normalized, target);
    let lo = Math.max(0, hi - 1);
    if (lo === hi) {
      xs.push(points[hi].x);
      values.push(canvasYToValue(points[hi].y, options.height));
      return;
    }
    const segmentU = normalized[hi] - normalized[lo] || 1;
    const ratio = (target - normalized[lo]) / segmentU;
    const xVal = points[lo].x + ratio * (points[hi].x - points[lo].x);
    const y = points[lo].y + ratio * (points[hi].y - points[lo].y);
    xs.push(xVal);
    values.push(canvasYToValue(y, options.height));
  });
  return { u: uniformU, values, x: xs };
}
