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
          purple: '#6B46C1',
          ice: '#E0F2FE',
        }
      }
    },
  },
  plugins: [],
}

