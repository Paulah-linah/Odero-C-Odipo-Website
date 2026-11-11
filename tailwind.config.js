/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './App.tsx', './index.tsx', './components/**/*.tsx', './views/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        ink: '#0a0a0a',
        paper: '#ffffff',
        mist: '#f6f6f4',
      },
      maxWidth: {
        page: '76rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
  plugins: [],
};
