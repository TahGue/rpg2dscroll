/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        desert: {
          sand: '#c4a35a',
          dusk: '#2a1f3d',
          night: '#1a1428',
          gold: '#d4a843',
          ember: '#e87a3b',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
