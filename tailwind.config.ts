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
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(18px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)' }
        },
        grow: { '0%': { transform: 'scaleX(0)' }, '100%': { transform: 'scaleX(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseDot: {
          '0%, 80%, 100%': { opacity: '0.25', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 280ms ease-out both',
        'pulse-dot': 'pulseDot 1.2s infinite ease-in-out',
        'fade-in': 'fade-in 400ms ease-out both',
        'scale-in': 'scale-in 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'slide-in': 'slide-in 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        pop: 'pop 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        grow: 'grow 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both',
        shimmer: 'shimmer 2.4s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
