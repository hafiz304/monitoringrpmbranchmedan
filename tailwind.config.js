/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alfamidi: {
          red: '#D71920',
          'red-dark': '#B51218',
          'red-light': '#FEE2E2',
          blue: '#005BAA',
          yellow: '#FFCC00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
