export type DrawingPoint = {
  x: number;
  y: number;
  t: number;
};

export const DEFAULT_CANVAS = {
  width: 960,
  height: 520,
};

export function createPoint(event: PointerEvent, rect: DOMRect): DrawingPoint {
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y, t: event.timeStamp };
}

export function canvasYToValue(y: number, height: number): number {
  if (height === 0) return 0;
  const normalized = 1 - (y / height) * 2;
  return Math.max(-1, Math.min(1, normalized));
}

export function valueToCanvasY(value: number, height: number): number {
  const clamped = Math.max(-1, Math.min(1, value));
  return ((1 - (clamped + 1) / 2) * height) || 0;
}

export function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  const commands = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`];
  for (const p of rest) {
    commands.push(`L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  return commands.join(' ');
}

export type TestSignalDefinition = {
  id: string;
  label: string;
  description: string;
  generate: (samples: number) => number[];
};

const TWO_PI = Math.PI * 2;

export const TEST_SIGNALS: TestSignalDefinition[] = [
  {
    id: 'sine',
    label: 'Pure Sine',
    description: 'A single 1 Hz sine wave to validate reconstruction.',
    generate: (samples) =>
      Array.from({ length: samples }, (_, i) => {
        const denom = Math.max(samples - 1, 1);
        const u = i / denom;
        return Math.sin(TWO_PI * u);
      }),
  },
  {
    id: 'mix',
    label: 'cos(x)+0.5sin(2x)',
    description: 'Combination that stresses both cosine and sine coefficients.',
    generate: (samples) =>
      Array.from({ length: samples }, (_, i) => {
        const denom = Math.max(samples - 1, 1);
        const u = i / denom;
        const x = TWO_PI * u;
        return Math.cos(x) + 0.5 * Math.sin(2 * x);
      }),
  },
  {
    id: 'triangle',
    label: 'Triangle Wave',
    description: 'Odd-harmonic rich waveform.',
    generate: (samples) =>
      Array.from({ length: samples }, (_, i) => {
        const denom = Math.max(samples - 1, 1);
        const u = i / denom;
        return 2 * Math.abs(2 * (u - Math.floor(u + 0.5))) - 1;
      }),
  },
  {
    id: 'square',
    label: 'Square Wave',
    description: 'Idealized square wave in [-1,1].',
    generate: (samples) =>
      Array.from({ length: samples }, (_, i) => {
        const denom = Math.max(samples - 1, 1);
        const u = i / denom;
        return u < 0.5 ? 1 : -1;
      }),
  },
  {
    id: 'saw',
    label: 'Sawtooth',
    description: 'Linearly increasing sawtooth.',
    generate: (samples) =>
      Array.from({ length: samples }, (_, i) => {
        const denom = Math.max(samples - 1, 1);
        const u = i / denom;
        return 2 * u - 1;
      }),
  },
  {
    id: 'offset-sine',
    label: 'Offset Sine',
    description: 'Tests constant + oscillatory content.',
    generate: (samples) =>
      Array.from({ length: samples }, (_, i) => {
        const denom = Math.max(samples - 1, 1);
        const u = i / denom;
        return 0.4 + 0.6 * Math.sin(TWO_PI * u);
      }),
  },
];

export function valuesToPoints(
  values: number[],
  width: number,
  height: number,
): DrawingPoint[] {
  if (!width || !height) {
    width = DEFAULT_CANVAS.width;
    height = DEFAULT_CANVAS.height;
  }
  const maxIndex = Math.max(values.length - 1, 1);
  return values.map((value, index) => ({
    x: (index / maxIndex) * width,
    y: valueToCanvasY(value, height),
    t: index,
  }));
}
