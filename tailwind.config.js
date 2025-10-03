/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "rialo-mint": "#a9ddd3",
        "rialo-beige": "#e8e3d5",
        "rialo-dark": "#010101",
        "rialo-blue": "#60a5fa",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
