import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#edf1f8',
          100: '#d0daea',
          200: '#a1b5d5',
          300: '#7290c0',
          400: '#4d74b0',
          500: '#2e5a9f',
          DEFAULT: '#1B2A4A',
          700: '#162240',
          800: '#111C35',
          900: '#0b1224',
          950: '#060b17',
        },
        ember: {
          50: '#fef3f0',
          100: '#fde4dd',
          200: '#facdbf',
          300: '#f6ac97',
          400: '#f0836a',
          DEFAULT: '#E8543A',
          600: '#d63d22',
          700: '#b32f19',
          800: '#932718',
          900: '#7a241a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'count-up': 'countUp 0.8s ease-out forwards',
        'marquee': 'marquee 28s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
