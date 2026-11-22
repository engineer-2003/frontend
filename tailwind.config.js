/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sakura: {
          lighter: "#FFF0F5", // 더 연한 벚꽃잎 (거의 흰색에 가까움)
          light: "#FDE2E4",   // 연한 벚꽃잎색
          DEFAULT: "#F9C5D1", // 기본 벚꽃색
          dark: "#F08CA0",    // 진한 벚꽃색
          darker: "#D46A7E",  // 더 진한 벚꽃색
          button: "#F08CA0"
        },
        leaf: {
          DEFAULT: "#d4f08e"
        },
        
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}