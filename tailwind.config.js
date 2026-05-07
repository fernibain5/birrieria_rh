/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4C2D0D',
          primaryHover: '#3A2109',
          primarySoft: '#F8EFE4',
          primaryMuted: '#7A4A17',
          secondary: '#F28705',
          secondaryHover: '#D97706',
          secondarySoft: '#FFF4E5',
        },
      },
    },
  },
  plugins: [],
};
