/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#11101f', 100: '#18172d', 200: '#29264a', 300: '#464075',
          400: '#7c72ff', 500: '#8b5cf6', 600: '#7c3aed', 700: '#a78bfa',
          800: '#c4b5fd', 900: '#ede9fe',
        },
        ink: {
          50: '#07080c', 100: '#0d0f15', 200: '#171a23', 300: '#272c38',
          400: '#555d70', 500: '#7f899d', 600: '#a7afbf', 700: '#c5cad5',
          800: '#e2e5eb', 900: '#f7f8fb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif Pro"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.3), 0 12px 32px rgba(0,0,0,.16)',
        panel: '0 12px 40px rgba(0,0,0,.32)',
        glow: '0 0 0 1px rgba(139,92,246,.2), 0 12px 40px rgba(124,58,237,.16)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out',
        float: 'float 5s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
