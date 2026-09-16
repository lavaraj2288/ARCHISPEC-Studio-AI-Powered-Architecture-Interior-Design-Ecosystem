/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        architect: {
          50: '#f8f8f7',
          100: '#efeeeb',
          200: '#dcda38',
          300: '#c2beba',
          400: '#9d9790',
          500: '#7e7870',
          600: '#645e57',
          700: '#504a44',
          800: '#433f3a',
          900: '#1f1e1c',
          950: '#121110',
        },
        blueprint: {
          50: '#eef8ff',
          100: '#d9f0ff',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c2438',
        },
        gold: {
          400: '#eab308',
          500: '#d97706',
          600: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.3), 0 0 15px rgba(234, 179, 8, 0.05)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
