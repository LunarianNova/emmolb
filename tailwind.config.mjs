/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        scoreboard: ['Scoreboard', 'Geist'],
        impact: ['Impact', 'Geist']
      }
    },
  },
  plugins: [],
}
