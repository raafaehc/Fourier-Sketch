import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const WIDTH = 640;
const HEIGHT = 220;

function smoothValues(values: number[], radius = 2): number[] {
  if (!values.length || radius <= 0) return values;
  const result = new Array(values.length);
  for (let i = 0; i < values.length; i += 1) {
    let sum = 0;
    let count = 0;
    for (let k = -radius; k <= radius; k += 1) {
      const idx = i + k;
      if (idx >= 0 && idx < values.length) {
        sum += values[idx];
        count += 1;
      }
    }
    result[i] = count ? sum / count : values[i];
  }
  return result;
}

type VisibleRange = { start: number; end: number };

function clampRange(range?: VisibleRange): VisibleRange {
  if (!range) return { start: 0, end: 1 };
  let { start, end } = range;
  start = Number.isFinite(start) ? Math.max(0, Math.min(1, start)) : 0;
  end = Number.isFinite(end) ? Math.max(0, Math.min(1, end)) : 1;
  if (end < start) end = start;
  return { start, end };
}

function buildPath(xs: number[], values: number[], range?: VisibleRange): string {
  if (!values.length) return '';
  const smoothed = smoothValues(values, 3);
  const safeXs = xs.length === values.length ? xs : values.map((_, idx) => idx);
  const minX = Math.min(...safeXs);
  const maxX = Math.max(...safeXs);
  const span = Math.max(maxX - minX, 1);
  const { start, end } = clampRange(range);
  const points: string[] = [];
  for (let index = 0; index < smoothed.length; index += 1) {
    const u = (safeXs[index] - minX) / span;
    if (u < start || u > end) continue;
    const normX = u * WIDTH;
    const value = smoothed[index];
    const normY = (1 - (value + 1) / 2) * HEIGHT;
    points.push(`${normX.toFixed(2)},${normY.toFixed(2)}`);
  }
  if (!points.length) return '';
  return `M ${points.join(' L ')}`;
}

type SpectralVizProps = {
  values: number[];
  reconstruction: number[];
  sampleX: number[];
  className?: string;
  mode: 'wave' | 'ribbon' | 'echo';
  theme: 'dark' | 'light' | 'midnight' | 'sunset' | 'forest' | 'neon' | 'aurora' | 'pink';
  onModeChange: (mode: SpectralVizProps['mode']) => void;
  visibleRange?: VisibleRange;
  isDrawing?: boolean;
};

export function SpectralViz({
  values,
  reconstruction,
  sampleX,
  className,
  mode,
  theme,
  onModeChange,
  visibleRange,
  isDrawing = false,
}: SpectralVizProps) {
  const range = clampRange(visibleRange);
  const rawPath = useMemo(
    () => buildPath(sampleX, values, range),
    [sampleX, values, range.start, range.end],
  );
  const reconPath = useMemo(
    () => buildPath(sampleX, reconstruction, range),
    [sampleX, reconstruction, range.start, range.end],
  );

  const visuals = {
    dark: { grid: 'rgba(148,163,184,0.12)', raw: '#94a3b8', background: 'url(#vizGrid)' },
    light: { grid: 'rgba(15,23,42,0.08)', raw: '#0f172a', background: 'rgba(15,23,42,0.04)' },
    midnight: { grid: 'rgba(99,102,241,0.18)', raw: '#c7d2fe', background: 'url(#vizGrid)' },
    sunset: { grid: 'rgba(248, 113, 113, 0.28)', raw: '#fecaca', background: 'rgba(30, 64, 175, 0.35)' },
    forest: { grid: 'rgba(34,197,94,0.25)', raw: '#bbf7d0', background: 'rgba(6, 95, 70, 0.5)' },
    neon: { grid: 'rgba(94,234,212,0.4)', raw: '#f9a8d4', background: 'rgba(15,23,42,0.9)' },
    aurora: { grid: 'rgba(52,211,153,0.32)', raw: '#bef264', background: 'rgba(15,23,42,0.9)' },
    pink: { grid: 'rgba(244,114,182,0.32)', raw: '#fecdd3', background: 'rgba(24,6,20,0.96)' },
  } as const;
  const vizColors = visuals[theme] ?? visuals.dark;

  return (
    <div
      className={cn('glass-card relative h-full overflow-hidden rounded-3xl border border-white/5 p-0', className)}
      aria-label="Spectral activity visualizer"
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Animated visualization of Fourier activity"
      >
        <defs>
          <linearGradient id="vizGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--accent-hover-color)" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {mode === 'wave' && (
          <>
            <g opacity={0.45}>
              <motion.path
                d={rawPath}
                fill="none"
                stroke={vizColors.raw}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0.3 }}
                animate={
                  isDrawing
                    ? { pathLength: 1, opacity: 0.5 }
                    : { pathLength: 1, opacity: [0.3, 0.7, 0.3] }
                }
                transition={
                  isDrawing
                    ? { duration: 0.4, ease: 'easeOut' }
                    : {
                        duration: 2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatType: 'reverse',
                      }
                }
              />
            </g>
            <motion.path
              d={reconPath}
              fill="none"
              stroke="url(#vizGradient)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.5 }}
              animate={
                isDrawing
                  ? { pathLength: 1, opacity: 0.9 }
                  : { pathLength: 1, opacity: [0.6, 1, 0.6] }
              }
              transition={
                isDrawing
                  ? { duration: 0.5, ease: 'easeOut' }
                  : {
                      duration: 2.8,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    }
              }
            />
          </>
        )}

        {mode === 'ribbon' && (
          <g>
            {[-8, 0, 8].map((offset, bandIndex) => (
              <motion.path
                key={`ribbon-${bandIndex}`}
                d={reconPath}
                fill="none"
                stroke="url(#vizGradient)"
                strokeWidth={bandIndex === 1 ? 8 : 4}
                strokeOpacity={bandIndex === 1 ? 0.5 : 0.25}
                strokeLinecap="round"
                strokeLinejoin="round"
                transform={`translate(0 ${offset})`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  isDrawing
                    ? { pathLength: 1, opacity: 0.7 }
                    : { pathLength: 1, opacity: [0.2, 0.8, 0.2] }
                }
                transition={
                  isDrawing
                    ? { duration: 0.6, ease: 'easeOut' }
                    : {
                        duration: 3.2 + bandIndex * 0.4,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }
                }
              />
            ))}
          </g>
        )}

        {mode === 'echo' && (
          <g>
            {[0, -6, 6].map((offset, echoIndex) => (
              <motion.path
                key={`echo-${echoIndex}`}
                d={reconPath}
                fill="none"
                stroke="url(#vizGradient)"
                strokeWidth={echoIndex === 0 ? 7 : 4}
                strokeOpacity={echoIndex === 0 ? 0.9 : 0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="12 8"
                transform={`translate(0 ${offset})`}
                initial={{ pathLength: 0, strokeDashoffset: 20 }}
                animate={
                  isDrawing
                    ? { pathLength: 1, strokeDashoffset: 10 }
                    : { pathLength: 1, strokeDashoffset: [0, 40] }
                }
                transition={
                  isDrawing
                    ? { duration: 0.6, ease: 'easeOut' }
                    : {
                        duration: 3.5 + echoIndex * 0.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                }
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
