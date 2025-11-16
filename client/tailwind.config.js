/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#ca9c43',
          ice: '#E0F2FE',
        },
        purple: {
          50: '#fef9e7',
          100: '#fef3cf',
          200: '#fde7a0',
          300: '#fcdb70',
          400: '#fbcf41',
          500: '#ca9c43',
          600: '#a87d36',
          700: '#865e2a',
          800: '#643e1d',
          900: '#421f11',
        }
      }
    }
  },
  plugins: [],
}

