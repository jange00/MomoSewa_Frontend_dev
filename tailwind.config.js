/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'deep-maroon': '#8B2E3D',
        'golden-amber': '#D69E28',
        'charcoal-grey': '#333333',
      },
    },
  },
  plugins: [],
}

