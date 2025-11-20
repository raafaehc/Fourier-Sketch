import type { DrawingPoint } from './drawing';

function perpendicularDistance(p: DrawingPoint, a: DrawingPoint, b: DrawingPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

export function simplifyPath(points: DrawingPoint[], tolerance = 1): DrawingPoint[] {
  if (points.length <= 2) return points;
  const maxDistance = { distance: 0, index: 0 };
  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (distance > maxDistance.distance) {
      maxDistance.distance = distance;
      maxDistance.index = i;
    }
  }
  if (maxDistance.distance > tolerance) {
    const left = simplifyPath(points.slice(0, maxDistance.index + 1), tolerance);
    const right = simplifyPath(points.slice(maxDistance.index), tolerance);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}
