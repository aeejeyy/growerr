import type { Config } from 'tailwindcss';

/**
 * Design tokens. Palette is inspired by a mint-green fintech look:
 *  - brand-500 (#00D09C) for fills, charts and highlights
 *  - brand-600 (#00A47E) for primary buttons (white text, ≥3:1)
 *  - brand-700 (#007F5F) for text links on white (≥4.5:1)
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6FAF5',
          100: '#CCF5EB',
          200: '#99EBD7',
          300: '#5CE0BF',
          400: '#1FD6A8',
          500: '#00D09C',
          600: '#00A47E',
          700: '#007F5F',
          800: '#035C46',
          900: '#05392D'
        },
        ink: {
          DEFAULT: '#1B1D29',
          soft: '#44475B',
          muted: '#6B6E7E',
          faint: '#A1A3AD'
        },
        line: {
          DEFAULT: '#E9E9EB',
          strong: '#D5D6DB'
        },
        canvas: '#F7F8FA',
        accent: {
          DEFAULT: '#5367FF',
          50: '#EEF0FF',
          700: '#3446D6'
        },
        loss: {
          DEFAULT: '#EB5B3C',
          50: '#FDEFEC',
          700: '#B93A1F'
        },
        warn: {
          DEFAULT: '#F5A524',
          50: '#FEF6E7',
          700: '#8A5A00'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        lift: '0 12px 32px -12px rgba(16, 24, 40, 0.18), 0 2px 6px rgba(16, 24, 40, 0.05)',
        glow: '0 0 0 4px rgba(0, 208, 156, 0.16)'
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
        '3xl': '24px'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseDot: {
          '0%, 80%, 100%': { opacity: '0.25', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 280ms ease-out both',
        'pulse-dot': 'pulseDot 1.2s infinite ease-in-out'
      }
    }
  },
  plugins: []
};

export default config;
