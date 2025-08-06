/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",      // app router
    "./pages/**/*.{js,ts,jsx,tsx}",    // se existir pages
    "./components/**/*.{js,ts,jsx,tsx}"// seus componentes
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-hover': 'var(--secondary-hover)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        tertiary: 'var(--tertiary)',
        'tertiary-hover': 'var(--tertiary-hover)',
        'tertiary-foreground': 'var(--tertiary-foreground)',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
