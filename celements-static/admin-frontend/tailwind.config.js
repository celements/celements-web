/** @type {import('tailwindcss').Config} */
import primeui from 'tailwindcss-primeui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  darkMode: ['selector', 'none'],
  plugins: [primeui],
  theme: {
    fontFamily: {
      /* Fonts used in celements2.css */
      'openSans': ['Open Sans', 'Tahoma', 'Geneva', 'Helvetica', 'Arial', 'sans-serif'],
      'terminalDosis': ['Terminal Dosis', 'Open Sans', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        /* Primary colors – used in index.html and PrimeVue surface tokens in main.css */
        schwarz: {
          100: 'rgb(var(--schwarz-100))',
          80: 'rgb(var(--schwarz-80))',
          60: 'rgb(var(--schwarz-60))',
          40: 'rgb(var(--schwarz-40))',
          20: 'rgb(var(--schwarz-20))',
        },
        /* Secondary colors – grau used directly as Tailwind class e.g. bg-grau-20 */
        grau: {
          100: 'rgb(var(--grau-100))',
          80: 'rgb(var(--grau-80))',
          60: 'rgb(var(--grau-60))',
          40: 'rgb(var(--grau-40))',
          20: 'rgb(var(--grau-20))',
          10: 'rgb(var(--grau-10))',
        },
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
}
