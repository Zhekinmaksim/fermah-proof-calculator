/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['"Crimson Pro"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        cream: '#f5f0e8',
        paper: '#efe7d8',
        ink: '#1a1a18',
        slate: '#2c2c2a',
        rust: '#c4511a',
        amber: '#d4940a',
        warm: { 100: '#f0ebe0', 200: '#e2dbd0', 300: '#c8bfb0', 400: '#8a8278', 500: '#5c564e' },
      },
    },
  },
  plugins: [],
}
