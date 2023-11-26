/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FC814A",
          light: "#FDAC86"
        },
        secondary: {
          DEFAULT: "#8377D1",
          light: "#9E95DB"
        },
        text: "#F2F2F2",
        input: "#000000",
        background: {
          dark: "#11151C",
          light: "#212D40"
        },
        fontFamily: {
          sans: ['Graphik', 'sans-serif'],
          serif: ['Merriweather', 'serif'],
        }
      },
    },
  },
  plugins: [],
}

