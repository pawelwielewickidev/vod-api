/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crunchy: {
          DEFAULT: "#F47521",
          dark: "#DF6300",
          panel: "#141519",
        },
      },
      fontFamily: {
        cinema: ['"Bebas Neue"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
