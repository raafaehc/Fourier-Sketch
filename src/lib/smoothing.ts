import type { DrawingPoint } from './drawing';

export function smoothPath(points: DrawingPoint[], passes: number): DrawingPoint[] {
  if (points.length < 3 || passes <= 1) return points;
  let smoothed = points;
  const iterations = Math.min(6, Math.max(1, Math.round(passes)));
  for (let iter = 0; iter < iterations; iter += 1) {
    const next: DrawingPoint[] = [smoothed[0]];
    for (let i = 0; i < smoothed.length - 1; i += 1) {
      const p0 = smoothed[i];
      const p1 = smoothed[i + 1];
      const q: DrawingPoint = {
        x: 0.75 * p0.x + 0.25 * p1.x,
        y: 0.75 * p0.y + 0.25 * p1.y,
        t: (p0.t + p1.t) / 2,
      };
      const r: DrawingPoint = {
        x: 0.25 * p0.x + 0.75 * p1.x,
        y: 0.25 * p0.y + 0.75 * p1.y,
        t: (p0.t + p1.t) / 2,
      };
      next.push(q, r);
    }
    next.push(smoothed[smoothed.length - 1]);
    smoothed = next;
  }
  return smoothed;
}
