/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors from Flutter app
        primary: '#c0f75b',
        secondary: '#dbf941',
        third: '#ccfe41',
        gradient1: '#c0f75b',
        
        // Background colors
        black: '#000000',
        white: '#ffffff',
        
        // Gray colors
        grey: '#57585A',
        borderGrey: '#B2B2B2',
        lightGrey: '#EFEFEF',
        veryLightGrey: '#D6D6D6',
        darkGrey: '#707070',
        veryDarkGrey: '#535353',
        
        // Additional colors
        red: '#ED635E',
        green: '#16BC43',
        blue: '#2E7EFF',
        facebook: '#3B5998',
        
        // Specific colors from Flutter
        colorF4F4F4: '#F4F4F4',
        color202020: '#202020',
        colorECECEC: '#ECECEC',
        colorDBDBDB: '#DBDBDB',
        colorFBF4FF: '#FBF4FF',
        color808080: '#808080',
        color57585A: '#57585A',
        colorF8F8F8: '#F8F8F8',
        color563196: '#563196',
        colorEEEEEE: '#EEEEEE',
        colorF1ECF9: '#F1ECF9',
        colorD9D9D9: '#D9D9D9',
        colorF0F1F1: '#F0F1F1',
        colorC5C5C6: '#C5C5C6',
        color1AA3FF: '#1AA3FF',
        color3EC188: '#3EC188',
        colorF6F6F6: '#F6F6F6',
        colorD2D5DA: '#D2D5DA',
        colorCCCCCC: '#CCCCCC',
        color838891: '#838891',
        color8852EB: '#8852EB',
        color1A1A1A: '#1A1A1A',
        colorE9EDF0: '#E9EDF0',
        color70777F: '#70777F',
        colorFFEEEE: '#FFEEEE',
        colorFF5151: '#FF5151',
        colorFCB638: '#FCB638',
        color1FB635: '#1FB635',
        yellow: '#E0B015',
        colorEBEBEB: '#EBEBEB',
        colorFDB514: '#FDB514',
        colorF7F4FC: '#F7F4FC',
        color242424: '#242424',
        color929293: '#929293',
        colorF1F1F1: '#F1F1F1',
        color0A0A0A: '#0A0A0A',
        colorF7F7F7: '#F7F7F7',
        colorBFBFBF: '#BFBFBF',
        color1B5E20: '#1B5E20',
        
        // Transparent colors
        white24: 'rgba(255, 255, 255, 0.15)',
        white54: 'rgba(255, 255, 255, 0.33)',
        white38: 'rgba(255, 255, 255, 0.22)',
        white10: 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        'newake': ['Newake', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
