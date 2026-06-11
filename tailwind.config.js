/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tt: {
          indigo: '#3200C1',
          'indigo-dark': '#24018A',
          'indigo-50': '#EAF2FC',
          'indigo-100': '#D8E7FF',
          'indigo-200': '#B2D0FF',
          'indigo-400': '#8593E5',
          'indigo-deep': '#221160',
          mint: '#37FFDB',
          'mint-dim': '#c8fff7',
          ink: '#343A40',
          'ink-2': '#666666',
          bg: '#F9F9F9',
          surface: '#FAFAFA',
          divider: '#E5E5E5',
          featured: '#F97316',
          sponsored: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
