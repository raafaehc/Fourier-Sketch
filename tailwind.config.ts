import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#05060a',
        surface: '#0c0f16',
        accent: '#38bdf8',
        muted: '#94a3b8',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
