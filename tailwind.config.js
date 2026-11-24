/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        abisal: '#040D21',
        oceano: '#0B2447',
        turquesa: '#19A7CE',
        marino: {
          50: '#EEF4FB',
          100: '#D9E7F5',
          200: '#B3CFEA',
          300: '#84AED6',
          400: '#4E86BE',
          500: '#1D5D9B',
          600: '#174E84',
          700: '#0F2C59',
          800: '#0B2447',
          900: '#040D21',
        },
        aji: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        rocoto: {
          500: '#E11D48',
          600: '#BE123C',
        },
        whatsapp: {
          500: '#16A34A',
          600: '#15803D',
        },
        marfil: '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        gastro: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(4, 13, 33, 0.14)',
        card: '0 8px 30px rgb(0,0,0,0.04)',
        float: '0 12px 32px -8px rgba(4, 13, 33, 0.30)',
        glow: '0 0 0 1px rgba(25, 167, 206, 0.25), 0 8px 30px rgba(25, 167, 206, 0.18)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
