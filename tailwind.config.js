/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF5',
          100: '#FFF8E8',
          200: '#FFF0D3',
          300: '#FFE8BE',
          400: '#FFDFA9',
        },
        'light-red': {
          50: '#FFF0F0',
          100: '#FFE1E1',
          200: '#FFD1D1',
          300: '#FFC2C2',
          400: '#FFB3B3',
          500: '#FF9A9A',
          600: '#FF8080',
        },
        accent: {
          100: '#FFB88C',
          200: '#FF9A76',
          300: '#FF8A65',
        },
      },
      animation: {
        'sound-wave': 'soundWave 1.2s infinite ease-in-out',
        'sound-wave-alt': 'soundWave 1.5s infinite ease-in-out 0.2s',
        'sound-wave-delay': 'soundWave 1.3s infinite ease-in-out 0.4s',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        soundWave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '24px' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
};