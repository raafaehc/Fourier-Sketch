import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

const WIDTH = 640;
const HEIGHT = 220;
const VIEW_OFFSET = 60;

function buildPath(xs: number[], values: number[]): string {
  if (!values.length) return '';
  const safeXs = xs.length === values.length ? xs : values.map((_, idx) => idx);
  const minX = Math.min(...safeXs);
  const maxX = Math.max(...safeXs);
  const span = Math.max(maxX - minX, 1);
  const points = values.map((value, index) => {
    const normX = ((safeXs[index] - minX) / span) * WIDTH;
    const normY = (1 - (value + 1) / 2) * HEIGHT;
    return `${normX.toFixed(2)},${normY.toFixed(2)}`;
  });
  return `M ${points.join(' L ')}`;
}

type SpectralVizProps = {
  values: number[];
  reconstruction: number[];
  sampleX: number[];
  className?: string;
  mode: 'wave' | 'bars' | 'flow';
  theme: 'dark' | 'light' | 'midnight' | 'sunset' | 'forest' | 'neon';
  onModeChange: (mode: 'wave' | 'bars' | 'flow') => void;
};

const vizOptions: { id: SpectralVizProps['mode']; label: string }[] = [
  { id: 'wave', label: 'Ribbon Wave' },
  { id: 'bars', label: 'Spectral Bars' },
  { id: 'flow', label: 'Flow Field' },
];

export function SpectralViz({
  values,
  reconstruction,
  sampleX,
  className,
  mode,
  theme,
  onModeChange,
}: SpectralVizProps) {
  const rawPath = useMemo(() => buildPath(sampleX, values), [sampleX, values]);
  const reconPath = useMemo(() => buildPath(sampleX, reconstruction), [sampleX, reconstruction]);
  const barData = useMemo(() => buildBarData(reconstruction), [reconstruction]);
  const flowLines = useMemo(() => buildFlowLines(reconstruction), [reconstruction]);

  const visuals = {
    dark: { grid: 'rgba(148,163,184,0.12)', raw: '#94a3b8', background: 'url(#vizGrid)' },
    light: { grid: 'rgba(15,23,42,0.08)', raw: '#0f172a', background: 'rgba(15,23,42,0.04)' },
    midnight: { grid: 'rgba(99,102,241,0.18)', raw: '#c7d2fe', background: 'url(#vizGrid)' },
    sunset: { grid: 'rgba(248, 113, 113, 0.28)', raw: '#fecaca', background: 'rgba(30, 64, 175, 0.35)' },
    forest: { grid: 'rgba(34,197,94,0.25)', raw: '#bbf7d0', background: 'rgba(6, 95, 70, 0.5)' },
    neon: { grid: 'rgba(94,234,212,0.4)', raw: '#f9a8d4', background: 'rgba(15,23,42,0.9)' },
  } as const;
  const vizColors = visuals[theme] ?? visuals.dark;

  return (
    <div
      className={cn('glass-card flex h-full flex-col rounded-3xl border border-white/5 p-4', className)}
      aria-label="Spectral activity visualizer"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Spectral heartbeat</p>
          <p className="text-sm text-white">Live view of harmonics vs. raw sketch</p>
        </div>
        <div className="flex gap-2">
          {vizOptions.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={mode === option.id ? 'primary' : 'ghost'}
              onClick={() => onModeChange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox={`0 ${-VIEW_OFFSET} ${WIDTH} ${HEIGHT + VIEW_OFFSET}`}
          role="img"
          aria-label="Animated visualization of Fourier activity"
        >
          <defs>
            <pattern id="vizGrid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d={`M0 0 H28`} stroke={vizColors.grid} strokeWidth="1" />
              <path d={`M0 0 V28`} stroke={vizColors.grid} strokeWidth="1" />
            </pattern>
            <linearGradient id="vizGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--accent-hover-color)" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" rx="24" fill={vizColors.background} />

          {mode === 'wave' && (
            <>
              <g opacity={0.45}>
                <motion.path
                  d={rawPath}
                  fill="none"
                  stroke={vizColors.raw}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.6, ease: 'easeInOut' }}
                />
              </g>
              <motion.path
                d={reconPath}
                fill="none"
                stroke="url(#vizGradient)"
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </>
          )}

          {mode === 'bars' && (
            <g>
              {barData.map((value, index) => {
                const gap = 4;
                const barWidth = WIDTH / barData.length - gap;
                const normalized = (value + 1) / 2;
                const barHeight = normalized * HEIGHT;
                const x = index * (barWidth + gap);
                const y = HEIGHT - barHeight;
                return (
                  <motion.rect
                    key={`bar-${index}`}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={6}
                    fill="url(#vizGradient)"
                    initial={{ height: 0, opacity: 0.4 }}
                    animate={{ height: barHeight, opacity: 0.9 }}
                    transition={{ duration: 0.8, delay: index * 0.03 }}
                  />
                );
              })}
            </g>
          )}

          {mode === 'flow' && (
            <g>
              {flowLines.map((path, index) => (
                <motion.path
                  key={`flow-${index}`}
                  d={path}
                  fill="none"
                  stroke="url(#vizGradient)"
                  strokeWidth={index === 0 ? 3 : 1.5}
                  strokeOpacity={index === 0 ? 0.9 : 0.4}
                  initial={{ pathLength: 0, opacity: 0.2 }}
                  animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 3 + index, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

function buildBarData(values: number[]): number[] {
  if (!values.length) return [];
  const bucketSize = Math.max(1, Math.floor(values.length / 32));
  const buckets: number[] = [];
  for (let i = 0; i < values.length; i += bucketSize) {
    const slice = values.slice(i, i + bucketSize);
    const avg = slice.reduce((sum, value) => sum + value, 0) / slice.length;
    buckets.push(avg);
  }
  return buckets;
}

function buildFlowLines(values: number[]): string[] {
  if (!values.length) return [];
  const lines: string[] = [];
  const segments = 160;
  const loops = 3;
  for (let band = 0; band < 3; band += 1) {
    const amplitude = 20 + band * 8;
    const offsetY = band * 12;
    const pts: string[] = [];
    for (let i = 0; i <= segments; i += 1) {
      const t = i / segments;
      const angle = t * Math.PI * 2 * loops;
      const index = Math.floor(t * values.length) % values.length;
      const value = values[index];
      const x = t * WIDTH + Math.sin(angle) * 12;
      const y = HEIGHT / 2 + offsetY + Math.sin(angle) * amplitude + value * 18;
      pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    lines.push(`M ${pts.join(' L ')}`);
  }
  return lines;
}
