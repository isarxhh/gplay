/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}", // adjust based on your setup
    ],
    theme: {
      extend: {
        fontFamily: {
          retro: ['"Press Start 2P"', "cursive"], // use quotes for multi-word names
        },
      },
    },
    plugins: [],
  };
  