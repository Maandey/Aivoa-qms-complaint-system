/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#F0F7FF',
          100: '#E0EFFF',
          200: '#B8DCFE',
          300: '#7AC0FD',
          400: '#389FFB',
          500: '#0C80E8',
          600: '#0062C4',
          700: '#014FA2',
          800: '#054486',
          900: '#0A3A6F',
        }
      }
    },
  },
  plugins: [],
}

