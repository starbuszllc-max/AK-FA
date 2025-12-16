module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        secondary: {
          500: '#10b981'
        },
        accent: {
          500: '#22c55e'
        },
        akorfa: {
          black: '#1a1a1a',
          green: '#16a34a',
          green_light: '#22c55e',
          dark: '#0f0f0f'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'pulse-success': 'pulseSuccess 0.6s ease-out'
      }
    }
  },
  plugins: []
};
