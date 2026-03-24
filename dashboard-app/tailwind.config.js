/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Lexend Deca"', 'sans-serif'],
      },
      colors: {
        navy: { DEFAULT: '#1B3A5C', dark: '#122840', light: '#2A5580' },
        sage: { DEFAULT: '#7A8B6F', light: '#8FA07E', bg: '#F0F3EC' },
      },
    },
  },
  plugins: [],
};
