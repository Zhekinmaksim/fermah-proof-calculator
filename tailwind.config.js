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
        canvas: '#f7f5ef',
        panel: '#fbfaf6',
        ink: '#111513',
        muted: '#5d6863',
        soft: '#87928d',
        line: 'rgba(17, 21, 19, 0.14)',
        rust: '#b94f23',
        steel: '#314a55',
        cyan: '#34b7c8',
        green: '#198754',
      },
    },
  },
  plugins: [],
}
