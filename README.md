# Fourier Sketch

Production-ready React + TypeScript playground for drawing arbitrary parametric paths, smoothing them, uniformly sampling by arc length, and generating a Desmos-ready real Fourier series.

## Features

- ✏️ Pointer, touch, and optional pen-only canvas with smooth quadratic rendering.
- 🌀 Arc-length parametrization that supports loops, spirals, and backtracking strokes.
- 🧮 Real Fourier series with adjustable harmonics, coefficient tables, and copy-to-clipboard Desmos export.
- 🧊 Modern dark glass UI (Tailwind + shadcn) with Framer Motion transitions and accessibility-first controls.
- 📚 Education panel, coachmarks, and preset signals for learners.
- ✅ Vitest unit tests + Playwright e2e + ESLint/Prettier + Vercel-ready deployment.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint with TypeScript + accessibility rules |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e tests (starts dev server automatically) |
| `npm run format` | Prettier |

## Tests

Unit tests cover smoothing, simplification, Fourier coefficients, and the arc-length sampler. Playwright draws a small loop to ensure the Fourier export stays valid.

## Deployment

Deploy directly to Vercel using the included Vite config. Set the build command to `npm run build` and the output directory to `dist`.
