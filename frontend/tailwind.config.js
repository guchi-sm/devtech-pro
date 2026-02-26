/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#0055FF',
          light: '#3377FF',
          dark: '#0044CC',
          glow: 'rgba(0,85,255,0.25)',
        },
        surface: {
          dark: '#070808',
          'dark-2': '#0E0F10',
          'dark-card': '#111314',
          light: '#F0EEE8',
          'light-2': '#E5E2DA',
          'light-card': '#FAFAF7',
        },
      },
      fontSize: {
        'display-xl': 'clamp(4rem, 12vw, 11rem)',
        'display-lg': 'clamp(2.8rem, 7vw, 6rem)',
        'display-md': 'clamp(1.8rem, 4vw, 3rem)',
      },
      animation: {
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'shimmer': 'shimmer 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'blink': 'blink 1s steps(1) infinite',
      },
      keyframes: {
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 3px rgba(0,230,118,0.25)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0,230,118,0.1)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(40px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
      backdropBlur: {
        nav: '20px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      spacing: {
        'nav': '68px',
      },
    },
  },
  plugins: [],
}
