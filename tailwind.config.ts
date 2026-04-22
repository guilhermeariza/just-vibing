import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        truco: {
          green: {
            900: 'var(--truco-green-900)',
            700: 'var(--truco-green-700)',
            500: 'var(--truco-green-500)',
            300: 'var(--truco-green-300)',
          },
          gold: {
            900: 'var(--truco-gold-900)',
            700: 'var(--truco-gold-700)',
            500: 'var(--truco-gold-500)',
            300: 'var(--truco-gold-300)',
          },
          red: {
            900: 'var(--truco-red-900)',
            500: 'var(--truco-red-500)',
            300: 'var(--truco-red-300)',
          },
          black: 'var(--truco-black)',
          gray: {
            900: 'var(--truco-gray-900)',
            700: 'var(--truco-gray-700)',
            500: 'var(--truco-gray-500)',
            300: 'var(--truco-gray-300)',
            100: 'var(--truco-gray-100)',
          },
          white: 'var(--truco-white)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        display: ['var(--font-display)', 'cursive'],
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
      },
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'glow': 'var(--shadow-glow)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'normal': 'var(--duration-normal)',
        'slow': 'var(--duration-slow)',
        'very-slow': 'var(--duration-very-slow)',
      },
      transitionTimingFunction: {
        'smooth': 'var(--ease-smooth)',
        'bounce': 'var(--ease-bounce)',
        'elastic': 'var(--ease-elastic)',
      },
      animation: {
        'card-flip': 'card-flip 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        'card-deal': 'card-deal 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'shake': 'shake 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-pulse': 'scale-pulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'card-deal': {
          '0%': {
            transform: 'translateY(-100vh) rotate(-45deg)',
            opacity: '0',
          },
          '60%': {
            transform: 'translateY(10px) rotate(5deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(0) rotate(0deg)',
            opacity: '1',
          },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 216, 151, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 216, 151, 0.8)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
