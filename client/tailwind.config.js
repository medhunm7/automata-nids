/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#070b14',
          card: '#0d1527',
          border: '#1e293b',
          accent: '#38bdf8',
          glow: '#0284c7',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          critical: '#dc2626',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(56, 189, 248, 0.4)',
        'glow-danger': '0 0 20px -5px rgba(239, 68, 68, 0.4)',
      }
    },
  },
  plugins: [],
}
