/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    colors: {
      primary: "#FC814A",
      secondary: "#8377D1",
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
    extend: {},
  },
  plugins: [],
}

