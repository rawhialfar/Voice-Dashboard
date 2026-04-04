const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Use class-based dark mode instead of media query
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        gray: colors.coolGray,
        blue: colors.lightBlue,
        red: colors.rose,
        pink: colors.fuchsia,
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Menlo', 'monospace'],
        monsterrat: ['Montserrat', 'sans-serif']
      },
      extend: {
        spacing: {
          '128': '32rem',
          '144': '36rem',
        },
        borderRadius: {
          '4xl': '2rem',
        }
      },
      weight:{
        100: 100,
        200: 200,
        300: 300,
        400: 400,
        500: 500,
        600: 600,
        700: 700,
        800: 800,
        900: 900
      },
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        dark: 'var(--color-dark)',
        'dark-off': 'var(--color-dark-off)',
        light: 'var(--color-light)',
        'light-off': 'var(--color-light-off)',
        gray: 'var(--color-gray)',
        primary: 'var(--color-primary)',
        'primary-highlight': 'var(--color-primary-highlight)',
        secondary: 'var(--color-secondary)',
        'secondary-highlight': 'var(--color-secondary-highlight)',
      },
      fontSize: {
        'xxl': 'var(--text-xxl)',
        'xl': 'var(--text-xl)',
        'l': 'var(--text-l)',
        'm': 'var(--text-m)',
        's': 'var(--text-s)',
        'xs': 'var(--text-xs)',
        'xxs': 'var(--text-xxs)',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      lineHeight: {
        '3': '.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
      },
      letterSpacing: {
        tighter: '-.05em',
        tight: '-.025em',
        normal: '0',
        wide: '.025em',
        wider: '.05em',
        widest: '.1em',
      },
    }
  },
  variants: {
    extend: {
      borderColor: ['focus-visible'],
      opacity: ['disabled'],
    }
  }
}