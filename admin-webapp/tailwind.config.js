/** @type {import('tailwindcss').Config} */
import primeui from 'tailwindcss-primeui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: ['selector', 'none'], 
  plugins: [primeui],
  theme: {
    fontFamily: {
      /* 3 Schriftschnitte der Futura für freien Einsatz. */
      'futuraBold': ['FuturaLTW05-Bold', 'Arial', 'sansSerif'],
      'futuraMedium': ['FuturaLTW05-Medium', 'Arial', 'sansSerif'],
      'futuraBook': ['FuturaLTW05-Book', 'Arial', 'sansSerif'],
      /* Gemäss Font StyleGuide momentan auf Webseiten nicht im Einsatz. */
      'futuraLight': ['FuturaLTW05-Light', 'Arial', 'sansSerif'],
    },
    extend: {
      colors: {
  /* Primärfarben */
  schwarz: {
    100: 'rgb(var(--schwarz-100))',
    80: 'rgb(var(--schwarz-80))',
    60: 'rgb(var(--schwarz-60))',
    40: 'rgb(var(--schwarz-40))',
    20: 'rgb(var(--schwarz-20))',
  },
  türkis: {
    100: 'rgb(var(--tuerkis-100))',
    80: 'rgb(var(--tuerkis-80))',
    60: 'rgb(var(--tuerkis-60))',
    40: 'rgb(var(--tuerkis-40))',
    20: 'rgb(var(--tuerkis-20))',
  },
  schattentürkis: {
    100: 'rgb(var(--schattentuerkis-100))',
    80: 'rgb(var(--schattentuerkis-80))',
    60: 'rgb(var(--schattentuerkis-60))',
    40: 'rgb(var(--schattentuerkis-40))',
    20: 'rgb(var(--schattentuerkis-20))',
  },
  violett: {
    100: 'rgb(var(--violett-100))',
    80: 'rgb(var(--violett-80))',
    60: 'rgb(var(--violett-60))',
    40: 'rgb(var(--violett-40))',
    20: 'rgb(var(--violett-20))',
  },
  schattenviolett: {
    100: 'rgb(var(--schattenviolett-100))',
    80: 'rgb(var(--schattenviolett-80))',
    60: 'rgb(var(--schattenviolett-60))',
    40: 'rgb(var(--schattenviolett-40))',
    20: 'rgb(var(--schattenviolett-20))',
  },
  rot: {
    100: 'rgb(var(--rot-100))',
    80: 'rgb(var(--rot-80))',
    60: 'rgb(var(--rot-60))',
    40: 'rgb(var(--rot-40))',
    20: 'rgb(var(--rot-20))',
  },
  schattenrot: {
    100: 'rgb(var(--schattenrot-100))',
    80: 'rgb(var(--schattenrot-80))',
    60: 'rgb(var(--schattenrot-60))',
    40: 'rgb(var(--schattenrot-40))',
    20: 'rgb(var(--schattenrot-20))',
  },
  /* Sekundärfarben: ergänzen Primärfarben für Akzente */
  grau: {
    100: 'rgb(var(--grau-100))',
    80: 'rgb(var(--grau-80))',
    60: 'rgb(var(--grau-60))',
    40: 'rgb(var(--grau-40))',
    20: 'rgb(var(--grau-20))',
    10: 'rgb(var(--grau-10))',
  },
  warmgrau: {
    100: 'rgb(var(--warmgrau-100))',
    80: 'rgb(var(--warmgrau-80))',
    60: 'rgb(var(--warmgrau-60))',
    40: 'rgb(var(--warmgrau-40))',
    20: 'rgb(var(--warmgrau-20))',
  },
  rosa: {
    100: 'rgb(var(--rosa-100))',
    80: 'rgb(var(--rosa-80))',
    60: 'rgb(var(--rosa-60))',
    40: 'rgb(var(--rosa-40))',
    20: 'rgb(var(--rosa-20))',
  },
  orange: {
    100: 'rgb(var(--orange-100))',
    80: 'rgb(var(--orange-80))',
    60: 'rgb(var(--orange-60))',
    40: 'rgb(var(--orange-40))',
    20: 'rgb(var(--orange-20))',
  },
  gelb: {
    100: 'rgb(var(--gelb-100))',
    80: 'rgb(var(--gelb-80))',
    60: 'rgb(var(--gelb-60))',
    40: 'rgb(var(--gelb-40))',
    20: 'rgb(var(--gelb-20))',
  },
  grün: {
    100: 'rgb(var(--gruen-100))',
    80: 'rgb(var(--gruen-80))',
    60: 'rgb(var(--gruen-60))',
    40: 'rgb(var(--gruen-40))',
    20: 'rgb(var(--gruen-20))',
  },
  blau: {
    100: 'rgb(var(--blau-100))',
    80: 'rgb(var(--blau-80))',
    60: 'rgb(var(--blau-60))',
    40: 'rgb(var(--blau-40))',
    20: 'rgb(var(--blau-20))',
  },
  /* abgedunkelte Sekundärfarben: für farbige Texte zur Erhöhung der Lesbarkeit */
  schattengrau: 'rgb(var(--schattengrau))',
  schattenwarmgrau: 'rgb(var(--schattenwarmgrau))',
  schattenrosa: 'rgb(var(--schattenrosa))',
  schattenorange: 'rgb(var(--schattenorange))',
  schattengelb: 'rgb(var(--schattengelb))',
  schattengrün: 'rgb(var(--schattengrün))',
  schattenblau: 'rgb(var(--schattenblau))',
},
      screens: {
        '3xl': '1920px',
      },
    },
  },
}

