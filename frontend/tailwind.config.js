/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f0a1c',
          card: '#18132b',
          border: '#2e254f',
          purple: '#6d28d9',
          indigo: '#4f46e5',
          teal: '#14b8a6',
          emerald: '#10b981',
          text: '#f1f5f9',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        glass: '8px',
      }
    },
  },
  plugins: [],
}
