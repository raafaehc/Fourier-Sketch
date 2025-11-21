import { useCallback, useEffect, useMemo, useRef } from 'react';
import { cn } from '../lib/utils';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { useResizeObserver } from '../hooks/useResizeObserver';
import { canvasReveal } from '../lib/animation';
import {
  createPoint,
  type DrawingPoint,
} from '../lib/drawing';
import type { DomainRange } from '../lib/domain';
import { OverlayReconstruction } from './OverlayReconstruction';
import { Coachmarks } from './Coachmarks';

export type CanvasPaneProps = {
  points: DrawingPoint[];
  onDrawingChange: (points: DrawingPoint[]) => void;
  penOnly: boolean;
  domain: DomainRange;
  reconstructionPath: { x: number; y: number }[];
  onResize?: (size: { width: number; height: number }) => void;
  classNameOverride?: string;
  theme?: 'dark' | 'light' | 'midnight' | 'sunset' | 'forest' | 'neon';
  onDrawingStateChange?: (isDrawing: boolean) => void;
};

export function CanvasPane({
  points,
  onDrawingChange,
  penOnly,
  domain,
  reconstructionPath,
  onResize,
  classNameOverride,
  theme = 'dark',
  onDrawingStateChange,
}: CanvasPaneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const activePoints = useRef<DrawingPoint[]>([]);
  const { ref, rect } = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (!rect) return;
    onResize?.({ width: rect.width, height: rect.height });
  }, [rect, onResize]);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rect) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio ?? 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const palette = {
      dark: {
        fill: 'rgba(5,6,10,0.95)',
        stroke: '#38bdf8',
        grid: 'rgba(148,163,184,0.12)',
        axis: 'rgba(148,163,184,0.2)',
        label: '#cbd5f5',
      },
      light: {
        fill: 'rgba(241,245,249,0.95)',
        stroke: '#0f172a',
        grid: 'rgba(15,23,42,0.15)',
        axis: 'rgba(15,23,42,0.25)',
        label: '#475569',
      },
      midnight: {
        fill: 'rgba(2,6,23,0.95)',
        stroke: '#a5b4fc',
        grid: 'rgba(99,102,241,0.25)',
        axis: 'rgba(99,102,241,0.35)',
        label: '#c7d2fe',
      },
      sunset: {
        fill: 'rgba(24,16,32,0.96)',
        stroke: '#fb7185',
        grid: 'rgba(248, 113, 113, 0.22)',
        axis: 'rgba(251, 113, 133, 0.35)',
        label: '#fecaca',
      },
      forest: {
        fill: 'rgba(5,24,12,0.96)',
        stroke: '#4ade80',
        grid: 'rgba(34,197,94,0.22)',
        axis: 'rgba(22,163,74,0.35)',
        label: '#bbf7d0',
      },
      neon: {
        fill: 'rgba(6,6,26,0.96)',
        stroke: '#22d3ee',
        grid: 'rgba(94,234,212,0.3)',
        axis: 'rgba(244, 63, 94, 0.4)',
        label: '#f9a8d4',
      },
    } as const;
    const colors = palette[theme] ?? palette.dark;
    ctx.fillStyle = colors.fill;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const span = Math.max(domain.b - domain.a, 1e-3);
    const start = Math.ceil(domain.a);
    const end = Math.floor(domain.b);
    for (let tick = start; tick <= end; tick += 1) {
      const ratio = (tick - domain.a) / span;
      const x = ratio * rect.width;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = colors.axis;
    const midY = rect.height / 2;
    ctx.moveTo(0, midY);
    ctx.lineTo(rect.width, midY);
    ctx.stroke();

    if (!points.length) return;
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = colors.stroke;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i += 1) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }, [points, rect, domain, theme]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (penOnly && event.pointerType !== 'pen') {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(event.pointerId);
      drawing.current = true;
      onDrawingStateChange?.(true);
      const rectBounds = canvas.getBoundingClientRect();
      const point = createPoint(event.nativeEvent, rectBounds);
      activePoints.current = [point];
      onDrawingChange([...activePoints.current]);
    },
    [onDrawingChange, penOnly],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rectBounds = canvas.getBoundingClientRect();
      const point = createPoint(event.nativeEvent, rectBounds);
      const prev = activePoints.current[activePoints.current.length - 1];
      const dist = Math.hypot(point.x - prev.x, point.y - prev.y);
      if (dist < 1.2) return;
      activePoints.current = [...activePoints.current, point];
      onDrawingChange(activePoints.current);
    },
    [onDrawingChange],
  );

  const handlePointerUp = useCallback(() => {
    drawing.current = false;
    onDrawingStateChange?.(false);
  }, []);

  const overlay = useMemo(() => {
    if (!rect) return null;
    return (
      <OverlayReconstruction
        path={reconstructionPath}
        width={rect.width}
        height={rect.height}
      />
    );
  }, [rect, reconstructionPath]);

  return (
    <motion.div
      ref={ref}
      variants={canvasReveal}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative min-h-[420px] overflow-hidden rounded-3xl border border-white/5 bg-white/5',
        classNameOverride,
      )}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Interactive drawing canvas"
        className="h-full w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {overlay}
      <Coachmarks />
    </motion.div>
  );
}
