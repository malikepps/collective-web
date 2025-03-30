/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        marfa: ['Marfa', 'sans-serif'],
      },
      colors: {
        primary: '#6E56CF',
        secondary: '#ECEDEE',
        background: '#111214',
        card: 'rgba(41, 41, 46, 0.7)',
      },
    },
  },
  plugins: [],
} 