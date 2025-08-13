/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode based on 'dark' class in HTML
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Add Inter font
      },
    },
  },
  plugins: [],
}