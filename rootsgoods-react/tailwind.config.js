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
          50: '#F6F9EC',
          100: '#EAF3D1',
          200: '#D5E8A3',
          300: '#C0DD75',
          400: '#ABD247',
          500: '#9BBE0C',
          600: '#7B970A',
          700: '#507212',
          800: '#3F5A0E',
          900: '#2A3C09',
        },
        ink: {
          DEFAULT: '#1E1C18',
          2: '#4A463D',
          3: '#6E6A61',
          4: '#9E9A90',
          5: '#C7C4BC',
        },
        surface: {
          bg: '#F8F9F5',
          card: '#FFFFFF',
          line: '#E3E5DC',
          hover: '#F2F4EC',
        },
        status: {
          ok: '#1E7E34',
          warn: '#C67D0A',
          danger: '#A93F2E',
          blue: '#1E62A9',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        btn: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(30,28,24,0.06), 0 1px 2px rgba(30,28,24,0.04)',
        modal: '0 10px 30px rgba(30,28,24,0.18)',
        bar: '0 -2px 10px rgba(30,28,24,0.06)',
      }
    },
  },
  plugins: [],
};
