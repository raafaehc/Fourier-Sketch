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
  const width = Math.max(options.width, 2);
  const height = Math.max(options.height, 2);

  const u = Array.from(
    { length: samples },
    (_, i) => (samples === 1 ? 0 : i / (samples - 1)),
  );

  const defaultX = u.map((t) => t * (width - 1));

  if (!points.length) {
    return { u, values: new Array(samples).fill(0), x: defaultX };
  }

  if (points.length === 1) {
    const yCanvas = points[0].y;
    const mathY = 1 - (2 * yCanvas) / (height - 1 || 1);
    const xs = new Array(samples).fill(points[0].x);
    const values = new Array(samples).fill(mathY);
    return { u, values, x: xs };
  }

  const sorted = [...points].sort((a, b) => a.x - b.x);
  const xsSource = sorted.map((p) => p.x);
  const ysSource = sorted.map((p) => p.y);

  const values: number[] = [];
  const xs: number[] = [];

  for (let n = 0; n < samples; n += 1) {
    const xq = (n / (samples - 1)) * (width - 1);
    let idx = lowerBound(xsSource, xq);

    let yCanvas: number;
    if (idx <= 0) {
      yCanvas = ysSource[0];
    } else if (idx >= xsSource.length) {
      yCanvas = ysSource[ysSource.length - 1];
    } else {
      const x1 = xsSource[idx - 1];
      const x2 = xsSource[idx];
      const y1 = ysSource[idx - 1];
      const y2 = ysSource[idx];
      const t = (xq - x1) / (x2 - x1 || 1);
      yCanvas = y1 + t * (y2 - y1);
    }

    const mathY = 1 - (2 * yCanvas) / (height - 1 || 1);
    values.push(mathY);
    xs.push(xq);
  }

  return { u, values, x: xs };
}
