/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f7f9fb', // Base Layer
          container: {
            low: '#f0f4f7',     // Primary Layout Blocks
            lowest: '#ffffff',  // Interactive/Floating Elements
            high: '#e3e9ed',    // Deep Content/Recessed Areas
          },
          low: '#f0f4f7',     // Fallback for legacy classes
          lowest: '#ffffff',
          bright: '#f7f9fb',  // App Bar
        },
        primary: {
          DEFAULT: '#1554d9', // Professional Blue
          container: '#d3e4fe',
          fixed: {
            dim: '#d3e4fe',
          }
        },
        secondary: {
          container: '#d3e4fe',
        },
        tertiary: {
          container: '#e0e7ff',
        },
        'on-surface': {
          DEFAULT: '#2c3437', // Softer black
          variant: '#5a6b73',
        },
        'outline-variant': 'rgba(44, 52, 55, 0.15)', // 15% opacity ghost border
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'], // Display & Headlines
        inter: ['Inter', 'sans-serif'],      // Body & Labels
      },
      borderRadius: {
        'lg': '0.75rem',    // 12px (Subtle for Main Cards)
        'md': '0.5rem',     // 8px (Standard Components)
        'sm': '0.375rem',
        'xl': '1rem',       // 16px (Special Layers)
        '2xl': '1.25rem',   // 20px (Maximum)
      },
      backdropBlur: {
        '20xl': '20px',
      }
    },
  },
  plugins: [],
}
