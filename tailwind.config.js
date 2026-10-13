export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: { ink: '#0b1b4d', brand: { DEFAULT: '#1677ff', dark: '#0b5ed7', soft: '#eaf3ff' } },
    },
  },
  plugins: [],
}
