/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "app-black": "#050505",
        "surface-dark": "#0A0A0A",
        "burgundy-primary": "#800020",
        "burgundy-dark": "#4A0414"
      },
      borderRadius: {
        xl: "1rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        "glow-burgundy": "0 0 15px rgba(128, 0, 32, 0.15)",
        "glow-subtle": "0 0 15px rgba(128, 0, 32, 0.05)"
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;

