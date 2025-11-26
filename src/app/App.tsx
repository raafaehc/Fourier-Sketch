import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CanvasPane } from '../components/CanvasPane';
import { Controls } from '../components/Controls';
import { EduPanel } from '../components/EduPanel';
import { CoefTable } from '../components/CoefTable';
import { Button } from '../components/ui/button';
import { Copy, Coffee } from 'lucide-react';
import { SpectralViz } from '../components/SpectralViz';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { simplifyPath } from '../lib/simplify';
import { smoothPath } from '../lib/smoothing';
import { resampleArcLength } from '../lib/resampleArcLength';
import { applyLanczosSigma, computeFourierCoefficients, evaluateFourierSeries } from '../lib/fourier';
import { formatSeriesText, buildDesmosExport } from '../lib/formatting';
import { DEFAULT_DOMAIN, normalizeDomain, type DomainRange } from '../lib/domain';
import {
  DEFAULT_CANVAS,
  TEST_SIGNALS,
  type DrawingPoint,
  valuesToPoints,
  valueToCanvasY,
} from '../lib/drawing';
import { cn } from '../lib/utils';
import { copyToClipboard } from '../lib/clipboard';
import { useToast } from '../components/Toast';

export default function App() {
  const [rawPoints, setRawPoints] = useState<DrawingPoint[]>([]);
  const samples = 1024;
  const [harmonics, setHarmonics] = useLocalStorage('fourier.harmonics', 12);
  const [smoothness, setSmoothness] = useLocalStorage('fourier.smoothness', 4);
  const [penOnly, setPenOnly] = useLocalStorage('fourier.pen-only', false);
  const [domainInput, setDomainInput] = useState<DomainRange>(DEFAULT_DOMAIN);
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS);
  const [isPreset, setIsPreset] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [explainLevel, setExplainLevel] = useState<'intro' | 'advanced'>('intro');
  const [seriesOpen, setSeriesOpen] = useState(true);
  const vizModes: Array<'wave' | 'ribbon' | 'echo'> = ['wave', 'ribbon', 'echo'];
  const [vizMode, setVizMode] = useState<'wave' | 'ribbon' | 'echo'>(() => {
    const index = Math.floor(Math.random() * vizModes.length);
    return vizModes[index];
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [reconClipProgress, setReconClipProgress] = useState(0);
  const [vizValues, setVizValues] = useState<number[]>([]);
  const [vizSampleX, setVizSampleX] = useState<number[]>([]);
  const seriesRef = useRef<HTMLDivElement | null>(null);
  type ThemeName = 'dark' | 'light' | 'midnight' | 'sunset' | 'forest' | 'neon' | 'aurora' | 'pink';
  const themeOptions: { id: ThemeName; label: string }[] = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'forest', label: 'Forest' },
    { id: 'neon', label: 'Neon' },
    { id: 'aurora', label: 'Aurora' },
    { id: 'pink', label: 'Pink' },
  ];
  const [theme, setTheme] = useLocalStorage<ThemeName>('fourier.theme', 'dark');
  const { toast } = useToast();

  useEffect(() => {
    document.body.dataset.theme = theme;
    const isLight = theme === 'light';
    document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
  }, [theme]);


  const domainSafe = useMemo(() => normalizeDomain(domainInput), [domainInput]);

  useEffect(() => {
    if (!isDrawing) return;
    const current = vizMode;
    let next = current;
    if (vizModes.length > 1) {
      while (next === current) {
        next = vizModes[Math.floor(Math.random() * vizModes.length)];
      }
    }
    setVizMode(next);
  }, [isDrawing, vizMode]);

  useEffect(() => {
    if (isDrawing) {
      setReconClipProgress(0);
      return;
    }
    if (!canvasSize.width) return;
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setReconClipProgress(t);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isDrawing, canvasSize.width]);

  const simplified = useMemo(
    () => simplifyPath(rawPoints, 1.2),
    [rawPoints],
  );

  const smoothed = useMemo(
    () => smoothPath(simplified, smoothness),
    [simplified, smoothness],
  );

  const { values, u: sampleU, x: sampleX } = useMemo(
    () =>
      resampleArcLength(smoothed, {
        samples,
        height: canvasSize.height,
        width: canvasSize.width,
      }),
    [smoothed, canvasSize.height, canvasSize.width],
  );

  const baseCoeffs = useMemo(
    () => computeFourierCoefficients(values, harmonics),
    [values, harmonics],
  );

  const coeffs = useMemo(
    () => applyLanczosSigma(baseCoeffs),
    [baseCoeffs],
  );

  const reconstructionValues = useMemo(
    () => evaluateFourierSeries(coeffs, sampleU),
    [coeffs, sampleU],
  );

  useEffect(() => {
    if (isDrawing) return;
    if (!reconstructionValues.length || !sampleX.length) return;
    setVizValues(reconstructionValues);
    setVizSampleX(sampleX);
  }, [isDrawing, reconstructionValues, sampleX]);

  const handleCopy = useCallback(async () => {
    const desmos = buildDesmosExport(coeffs, domainSafe);
    await copyToClipboard(desmos);
    toast({
      title: 'Series copied',
      description: 'Paste into Desmos to visualize the reconstruction.',
    });
  }, [coeffs, domainSafe, toast]);

  const handleScrollToSeries = useCallback(() => {
    if (seriesRef.current) {
      seriesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleSelectSignal = useCallback(
    (id: string) => {
      const signal = TEST_SIGNALS.find((item) => item.id === id);
      if (!signal) return;
      const generated = signal.generate(samples);
      const points = valuesToPoints(generated, canvasSize.width, canvasSize.height);
      setRawPoints(points);
       setIsPreset(true);
      toast({ title: 'Preset applied', description: signal.label });
    },
    [canvasSize.height, canvasSize.width, toast],
  );

  const handleDrawingChange = useCallback((points: DrawingPoint[]) => {
    setRawPoints(points);
    setIsPreset(false);
  }, []);

  const handleClear = useCallback(() => {
    setRawPoints([]);
    setIsPreset(false);
  }, []);

  const handleDomainChange = useCallback((range: DomainRange) => {
    setDomainInput(normalizeDomain(range));
  }, []);

  const seriesText = useMemo(() => formatSeriesText(coeffs), [coeffs]);
  const desmosExport = useMemo(() => buildDesmosExport(coeffs, domainSafe), [coeffs, domainSafe]);

  const displayPoints = useMemo(
    () => (isPreset ? rawPoints : smoothed.length ? smoothed : rawPoints),
    [isPreset, rawPoints, smoothed],
  );

  const reconstructionPath = useMemo(() => {
    if (!reconstructionValues.length) return [];
    const full = reconstructionValues.map((value, index) => {
      const xCoord =
        sampleX[index] ?? (sampleU[index] ?? 0) * Math.max(canvasSize.width - 1, 1);
      return {
        x: xCoord,
        y: valueToCanvasY(value, canvasSize.height),
      };
    });
    if (!displayPoints.length || !canvasSize.width) return full;

    let minDrawX = Infinity;
    let maxDrawX = -Infinity;
    for (const point of displayPoints) {
      if (point.x < minDrawX) minDrawX = point.x;
      if (point.x > maxDrawX) maxDrawX = point.x;
    }
    if (!Number.isFinite(minDrawX) || !Number.isFinite(maxDrawX)) return full;

    let clipLeft: number;
    let clipRight: number;

    if (isDrawing) {
      clipLeft = minDrawX;
      clipRight = maxDrawX;
    } else {
      const t = reconClipProgress;
      clipLeft = minDrawX * (1 - t);
      clipRight = maxDrawX + (canvasSize.width - maxDrawX) * t;
    }

    if (clipRight <= clipLeft) return full;
    return full.filter((point) => point.x >= clipLeft && point.x <= clipRight);
  }, [reconstructionValues, sampleX, sampleU, canvasSize.width, canvasSize.height, displayPoints, isDrawing, reconClipProgress]);

  const vizVisibleRange = useMemo(() => {
    if (!displayPoints.length || !canvasSize.width) {
      return { start: 0, end: 1 };
    }

    let minDrawX = Infinity;
    let maxDrawX = -Infinity;
    for (const point of displayPoints) {
      if (point.x < minDrawX) minDrawX = point.x;
      if (point.x > maxDrawX) maxDrawX = point.x;
    }
    if (!Number.isFinite(minDrawX) || !Number.isFinite(maxDrawX)) {
      return { start: 0, end: 1 };
    }

    let clipLeft: number;
    let clipRight: number;

    if (isDrawing) {
      clipLeft = minDrawX;
      clipRight = maxDrawX;
    } else {
      const t = reconClipProgress;
      clipLeft = minDrawX * (1 - t);
      clipRight = maxDrawX + (canvasSize.width - maxDrawX) * t;
    }

    if (clipRight <= clipLeft) {
      return { start: 0, end: 1 };
    }

    const start = Math.max(0, Math.min(1, clipLeft / canvasSize.width));
    const end = Math.max(start, Math.min(1, clipRight / canvasSize.width));
    return { start, end };
  }, [displayPoints, canvasSize.width, isDrawing, reconClipProgress]);

  return (
    <motion.main
      className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 text-white"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {!onboardingDismissed ? (
        <motion.div
          className="pointer-events-none fixed bottom-4 right-4 z-30 max-w-sm"
          initial={{ opacity: 0, y: 10, x: 6 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/75 px-4 py-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Quick tips</p>
                <h3 className="text-sm font-semibold text-white">First time?</h3>
              </div>
              <Button size="sm" variant="ghost" className="rounded-full px-2" onClick={() => setOnboardingDismissed(true)}>
                Skip
              </Button>
            </div>
            <div className="mt-2 space-y-2 text-xs text-muted">
              {onboardingStep === 0 && (
                <p>Draw left → right on the canvas. We smooth and resample your stroke automatically.</p>
              )}
              {onboardingStep === 1 && (
                <p>Use Harmonics and Smoothing to tune the approximation on the right.</p>
              )}
              {onboardingStep === 2 && (
                <p>Copy Desmos to paste the series into Desmos. Adjust the domain if needed.</p>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full px-3"
                disabled={onboardingStep === 0}
                onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
              >
                Back
              </Button>
              <Button
                size="sm"
                className="rounded-full px-3"
                onClick={() => {
                  if (onboardingStep >= 2) {
                    setOnboardingDismissed(true);
                  } else {
                    setOnboardingStep((prev) => Math.min(2, prev + 1));
                  }
                }}
              >
                {onboardingStep >= 2 ? 'Done' : 'Next'}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : null}
      <motion.header
        className="space-y-3"
        initial={{ opacity: 0, y: -16, x: -14 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut', delay: 0.05 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-muted">Fourier Sketch Lab</p>
            <h1 className="mt-1 font-display text-3xl text-white">
              Draw anything. Watch waves rebuild it.
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-2 py-1 shadow-[0_10px_24px_rgba(15,23,42,0.45)]">
                <span className="text-[11px] uppercase tracking-[0.15em] text-muted">Theme</span>
                <div className="flex overflow-hidden rounded-full border border-white/10 bg-black/40">
                  {themeOptions.map((option) => {
                    const active = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setTheme(option.id as ThemeName)}
                        className={cn(
                          'px-3 py-1 text-[11px] transition',
                          active
                            ? 'bg-[var(--accent-color)] text-black'
                            : 'text-muted hover:text-white hover:bg-white/10',
                        )}
                        aria-pressed={active}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <a
              href="https://www.buymeacoffee.com/raafaehc"
              target="_blank"
              rel="noreferrer"
              className="inline-flex transform items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 text-[11px] text-muted backdrop-blur-sm transition hover:border-accent hover:text-white hover:scale-[1.08]"
            >
              <Coffee className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Want to support the project?</span>
              <span className="font-semibold text-white">Buy me a coffee</span>
            </a>
          </div>
        </div>
        <p className="text-sm text-muted">
          Smooth your strokes, resample by arc length, and export a Desmos-ready real Fourier series.
        </p>
      </motion.header>

      <motion.section
        className="grid gap-6 lg:grid-cols-[minmax(0,_8fr)_minmax(320px,_3fr)]"
        initial={{ opacity: 0, y: 22, x: 14 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
      >
          <div className="flex h-full flex-col gap-2">
            <div className="relative flex-1">
          <CanvasPane
            points={displayPoints}
            onDrawingChange={handleDrawingChange}
            penOnly={penOnly}
            domain={domainSafe}
            reconstructionPath={reconstructionPath}
            onResize={setCanvasSize}
            classNameOverride="min-h-[600px]"
            theme={theme}
            onDrawingStateChange={setIsDrawing}
          />
              <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-between">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="pointer-events-auto flex transform items-center gap-2 rounded-full border canvas-action-border bg-gradient-to-r from-black/15 via-[var(--accent-color)]/22 to-black/8 px-3 py-1 text-[11px] text-white shadow-[0_12px_30px_rgba(15,23,42,0.65)] backdrop-blur-sm transition hover:shadow-[0_16px_40px_rgba(15,23,42,0.9)] hover:scale-[1.08]"
                  aria-label="Copy Desmos export"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Desmos
                </button>
                <button
                  type="button"
                  onClick={handleScrollToSeries}
                  className="pointer-events-auto flex transform items-center gap-2 rounded-full border canvas-action-border bg-gradient-to-r from-black/15 via-[var(--accent-color)]/18 to-black/8 px-3 py-1 text-[11px] text-white shadow-[0_12px_30px_rgba(15,23,42,0.65)] backdrop-blur-sm transition hover:shadow-[0_16px_40px_rgba(15,23,42,0.9)] hover:scale-[1.08]"
                  aria-label="Jump to series section"
                >
                  Jump to series
                </button>
              </div>
            </div>
            <PresetBubbles onSelect={handleSelectSignal} className="-mt-2" />
        </div>
        <div className="flex h-full flex-col gap-3">
          <Controls
            harmonics={harmonics}
            onHarmonicsChange={setHarmonics}
            smoothness={smoothness}
            onSmoothnessChange={setSmoothness}
            domain={domainSafe}
            onDomainChange={handleDomainChange}
            penOnly={penOnly}
            onPenToggle={setPenOnly}
            onClear={handleClear}
          />
         <SpectralViz
            values={!isDrawing && vizValues.length > 0 && vizSampleX.length > 0 ? vizValues : []}
            reconstruction={!isDrawing && vizValues.length > 0 && vizSampleX.length > 0 ? vizValues : []}
            sampleX={!isDrawing && vizValues.length > 0 && vizSampleX.length > 0 ? vizSampleX : []}
            className="mt-auto min-h-[260px] overflow-hidden"
            mode={vizMode}
            theme={theme}
            onModeChange={setVizMode}
            visibleRange={vizVisibleRange}
            isDrawing={false}
          />
        </div>
      </motion.section>

      <motion.section
        className="space-y-6"
        initial={{ opacity: 0, y: 26, x: -14 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.28 }}
      >
        <MathExplainer
          level={explainLevel}
          onLevelChange={setExplainLevel}
        />
        <div
          ref={seriesRef}
          className="glass-card space-y-4 rounded-3xl border border-white/5 p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted">Series & Coefficients</p>
              <p className="text-lg font-semibold text-white">See how each harmonic contributes</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={seriesOpen ? 'primary' : 'ghost'}
                aria-expanded={seriesOpen}
                onClick={() => setSeriesOpen((prev) => !prev)}
              >
                {seriesOpen ? 'Hide Series' : 'Show Series'}
              </Button>
            </div>
          </div>
          {seriesOpen ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted">Series (u-space)</p>
              <code
                className="block rounded-2xl bg-black/30 p-3 text-xs text-accent"
                aria-live="polite"
                data-testid="series-text"
              >
                {seriesText}
              </code>
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <CoefTable title="cos(k)" values={coeffs.an} />
            <CoefTable title="sin(k)" values={coeffs.bn} />
          </div>
        </div>
      </motion.section>

    </motion.main>
  );
}

type ExplainLevel = 'intro' | 'advanced';

type MathExplainerProps = {
  level: ExplainLevel;
  onLevelChange: (level: ExplainLevel) => void;
};

function MathExplainer({ level, onLevelChange }: MathExplainerProps) {
  const introCopy = [
    '1. We smooth and simplify your hand-drawn path so noise does not overwhelm the Fourier fit.',
    '2. The stroke is parameterized by arc length (u ∈ [0,1]) so loops and backtracks stay intact.',
    '3. Cosine (even) and sine (odd) harmonics add up to recreate your drawing.',
  ];
  const advancedCopy = [
    '• We solve a truncated real Fourier series (not Taylor/Maclaurin). Taylor/Maclaurin approximate about a single point; Fourier approximates globally using periodic basis functions, which is what a looping sketch needs.',
    '• The path is parameterized by normalized arc length u = s/s_total so samples track travel distance along the stroke rather than x-position; this preserves loops and cusps.',
    '• Samples are uniformly placed in u and each canvas y-value is remapped to math space [-1,1] before analysis, ensuring amplitude is scale-invariant.',
    '• Each coefficient has geometric meaning: a₀/2 is your average level, aₙ scales cosine waves that keep the sketch even, and bₙ scales sine waves that capture the odd, phase-shifted structure. Plugging them into f(u) = a₀/2 + Σ[aₙ cos(n·2πu) + bₙ sin(n·2πu)] recreates the curve.',
    '• Coefficients use trapezoidal integration of f(u)cos(k·2πu) and f(u)sin(k·2πu); endpoints get half-weight to reduce spectral leakage and match the periodic extension.',
    '• The exported series substitutes x′ = 2π·(x-a)/(b-a), which scales any user-defined domain {a<x<b} back to the unit interval so Desmos reproduces the same drawing.',
    '• Smoothing + RDP simplification happen before sampling so we solve for the dominant structure instead of high-frequency hand jitter.',
  ];
  return (
    <div className="glass-card rounded-3xl border border-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted">Understanding the math</p>
          <p className="text-lg font-semibold text-white">Choose how deep you want to go</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={level === 'intro' ? 'primary' : 'ghost'}
            onClick={() => onLevelChange('intro')}
          >
            Essentials
          </Button>
          <Button
            size="sm"
            variant={level === 'advanced' ? 'primary' : 'ghost'}
            onClick={() => onLevelChange('advanced')}
          >
            Advanced
          </Button>
        </div>
      </div>
      {level === 'intro' ? (
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {introCopy.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ul className="space-y-2 text-sm text-muted">
            {advancedCopy.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <EduPanel />
        </div>
      )}
    </div>
  );
}

type PresetBubblesProps = {
  onSelect: (id: string) => void;
  className?: string;
};

function PresetBubbles({ onSelect, className }: PresetBubblesProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-3xl border border-white/5 bg-white/5 px-4 py-3',
        className,
      )}
    >
      <span className="text-xs uppercase tracking-wide text-muted">Quick waves:</span>
      {TEST_SIGNALS.map((signal) => (
        <button
          key={signal.id}
          type="button"
          onClick={() => onSelect(signal.id)}
          className="transform rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-white hover:scale-[1.08]"
        >
          {signal.label}
        </button>
      ))}
    </div>
  );
}
