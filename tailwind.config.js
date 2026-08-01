/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#165a32',
        'primary-light': '#1e7d47',
        'primary-dark': '#0d3d22',
        accent: '#f0faf4',
        gold: '#c9a227'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
