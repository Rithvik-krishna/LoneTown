// tailwind.config.js
module.exports = {
  
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
      'xs': '400px',
      colors: {
        primary: '#093FB4',
        background: '#FFFCFB',
        accent: '#FFD8D8',
        danger: '#ED3500',
      },
    },
  },
  plugins: [],
},
}