/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        // Brand violet — primary action color
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Brand gold — accent / premium feel
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Dark surface palette
        surface: {
          50: '#f8f7ff',
          100: '#f1f0fa',
          800: '#1a1625',
          900: '#120f1e',
          950: '#0a0812',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0a0812 0%, #1a1625 50%, #2e1065 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(124,58,237,0.1) 0%, rgba(76,29,149,0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(124, 58, 237, 0.35)',
        'brand-lg': '0 8px 40px rgba(124, 58, 237, 0.45)',
        'gold': '0 4px 24px rgba(245, 158, 11, 0.35)',
        'card': '0 2px 20px rgba(0, 0, 0, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
