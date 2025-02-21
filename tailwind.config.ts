import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        'neutral-900': '#2C2C2C',
        'neutral-700': '#4A4A4A',
        'neutral-500': '#717171',
        'neutral-300': '#E0E0E0',
        'neutral-100': '#F5F5F5'
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        accent: ['Playfair Display', 'serif']
      }
    }
  },
  plugins: [],
} satisfies Config
