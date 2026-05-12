tailwind.config = {
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
          100: '#000000ff',
          80: '#000000cc',
          60: '#00000099',
          40: '#00000066',
          20: '#00000033',
        },
        türkis: {
          100: '#00a8b1ff',
          80: '#00a8b1cc',
          60: '#00a8b199',
          40: '#00a8b166',
          20: '#00a8b133',
        },
        schattentürkis: {
          100: '#007e80ff',
          80: '#007e80cc',
          60: '#007e8099',
          40: '#007e8066',
          20: '#007e8033',
        },
        violett: {
          100: '#8859a1ff',
          80: '#8859a1cc',
          60: '#8859a199',
          40: '#8859a166',
          20: '#8859a133',
        },
        schattenviolett: {
          100: '#704686ff',
          80: '#704686cc',
          60: '#70468699',
          40: '#70468666',
          20: '#70468633',
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
        /* Sekundärfarben: ergänzen Primärfarben für Akzente */
        grau: {
          100: '#dededeff',
          80: '#dededecc',
          60: '#dedede99',
          40: '#dedede66',
          20: '#dedede33',
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
        /* abgedunkelte Sekundärfarben: für farbige Texte zur Erhöhung der Lesbarkeit */
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
}

