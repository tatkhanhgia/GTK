// Tailwind v4 uses CSS-first configuration via @theme in globals.css.
// This file exists for tooling compatibility (editors, linters).
// All design tokens are defined in src/app/globals.css under @theme.
// See: https://tailwindcss.com/docs/v4-upgrade

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Be Vietnam Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: { DEFAULT: '#D97757', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#C4713E', foreground: '#FFFFFF' },
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}

export default config
