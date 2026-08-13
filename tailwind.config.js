/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1920px',
      },
      maxWidth: {
        // Visual page shells get room on modern desktop and ultrawide displays.
        // Reading widths (3xl/4xl) intentionally remain unchanged.
        '5xl': '72rem',
        '6xl': '84rem',
        '7xl': '104rem',
      },
      keyframes: {
        'arrow-salvo': {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(4px)' },
          '30%': { transform: 'translateX(0)' },
          '45%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(0)' },
        }
      },
      animation: {
        'arrow-salvo': 'arrow-salvo 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
