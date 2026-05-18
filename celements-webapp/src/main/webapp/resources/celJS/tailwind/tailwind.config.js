tailwind.config = {
  theme: {
    fontFamily: {
      /* Fonts used in celements2.css */
      openSans: ['Open Sans', 'Tahoma', 'Geneva', 'Helvetica', 'Arial', 'sans-serif'],
      terminalDosis: ['Terminal Dosis', 'Open Sans', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        /* Primary colors */
        schwarz: {
          100: '#000000ff',
          80: '#333333ff',
          60: '#666666ff',
          40: '#999999ff',
          20: '#ccccccff',
        },
        rot: {
          100: '#e60003ff',
          80: '#e60003cc',
          60: '#e6000399',
          40: '#e6000366',
          20: '#e6000333',
        },
        schattenrot: {
          100: '#bd0006ff',
          80: '#bd0006cc',
          60: '#bd000699',
          40: '#bd000666',
          20: '#bd000633',
        },
        /* Secondary colors: complement primary colors for accents */
        grau: {
          100: '#dededeff',
          80: '#e0e0e0cc',
          60: '#e6e6e699',
          40: '#ebebeb66',
          20: '#f1f1f133',
          10: '#f8f8f81a',
        },
        warmgrau: {
          100: '#d5c9b6ff',
          80: '#d5c9b6cc',
          60: '#d5c9b699',
          40: '#d5c9b666',
          20: '#d5c9b633',
        },
        rosa: {
          100: '#f087b5ff',
          80: '#f087b5cc',
          60: '#f087b599',
          40: '#f087b566',
          20: '#f087b533',
        },
        orange: {
          100: '#f9b000ff',
          80: '#f9b000cc',
          60: '#f9b00099',
          40: '#f9b00066',
          20: '#f9b00033',
        },
        gelb: {
          100: '#ffdd00ff',
          80: '#ffdd00cc',
          60: '#ffdd0099',
          40: '#ffdd0066',
          20: '#ffdd0033',
        },
        grün: {
          100: '#afca00ff',
          80: '#afca00cc',
          60: '#afca0099',
          40: '#afca0066',
          20: '#afca0033',
        },
        blau: {
          100: '#5ac5f2ff',
          80: '#5ac5f2cc',
          60: '#5ac5f299',
          40: '#5ac5f266',
          20: '#5ac5f233',
        },
        /* Darkened secondary colors: for colored text to improve readability */
        schattengrau: '#a6a6a6',
        schattenwarmgrau: '#b19b77',
        schattenrosa: '#e63482',
        schattenorange: '#bb8400',
        schattengelb: '#bfa600',
        schattengrün: '#839700',
        schattenblau: '#12a8e7',
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
};
