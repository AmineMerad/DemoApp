/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#16D1A6",
        secondary: "#8142a4",
        tertiary: "#005db7",
        background: {
          DEFAULT: "#f7f9fb",
          dark: "#0e1322",
        },
        surface: {
          DEFAULT: "#f7f9fb",
          dark: "#1a1f2f",
          "dark-container": "#25293a",
        },
        "surface-container": {
          DEFAULT: "#eceef0",
          lowest: "#ffffff",
          low: "#f2f4f6",
          high: "#e6e8ea",
          highest: "#e0e3e5",
        },
        text: {
          primary: "#191c1e",
        },
        outline: {
          DEFAULT: "#6b7a74",
          variant: "#bacac2",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
}