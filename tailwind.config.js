/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: '#252A30',
          dark: '#1c2025',
          light: '#323841',
          muted: '#59616B',
        },
        cloud: {
          DEFAULT: '#F5F6F2',
          light: '#FAFAF8',
          card: '#FFFFFF',
          border: '#DCE3E8',
          grey: '#E9ECEF',
        },
        yellow: {
          DEFAULT: '#FFD447',
          sunshine: '#FFD447',
          hover: '#FFDF66',
          active: '#F5C62F',
          soft: '#FFF2BD',
          pale: '#FFFBEA',
        },
        status: {
          success: '#36A875',
          error: '#DC5555',
          warning: '#EBAE43',
        }
      },
      borderRadius: {
        'control': '12px',
        'input': '14px',
        'btn': '16px',
        'card': '20px',
        'modal': '24px',
        'panel': '26px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(37, 42, 48, 0.06)',
        'glass-hover': '0 12px 40px 0 rgba(37, 42, 48, 0.1)',
        'yellow-btn': '0 6px 20px -2px rgba(255, 212, 71, 0.45)',
        'yellow-hover': '0 10px 25px -2px rgba(255, 212, 71, 0.6)',
        'card-soft': '0 4px 20px 0 rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
