import Themes from './themes'
import tailwindAnimate from 'tailwindcss-animate'
import { fontFamily } from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[class="dark"]'],
  content: [
    './index.html',
    './api-doc/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './constants/**/*.{js,ts,jsx,tsx}',
    './providers/**/*.{js,ts,jsx,tsx}',
    './wallets/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/ui/src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/core/api-doc/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/core/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/core/constants/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/core/dialogs/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/core/providers/**/*.{js,ts,jsx,tsx}',
    './node_modules/@cosmoscan/core/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      screens: {
        '2xl': '1400px',
      },
      spacing: {
        gap: 'var(--gap)',
        'page-gap': 'var(--gap-page)',
        'menu-w': '260px',
        'menu-collapse-w': '100px',
        'mobile-header-h': '4rem',
      },
      colors: {
        green: 'hsl(var(--green))',
        red: 'hsl(var(--red))',
        orange: 'hsl(var(--orange))',
        yellow: 'hsl(48 100% 50%)',
        menu: 'hsl(var(--menu))',
        border: {
          DEFAULT: 'hsl(var(--border))',
          light: 'hsl(var(--border)/0.2)',
        },
        input: 'hsl(var(--input))',
        ring: {
          DEFAULT: 'transparent',
          offset: 'transparent',
        },
        background: 'hsl(var(--background))',
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--foreground-secondary))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'hsl(var(--foreground))',
            a: {
              color: 'hsl(var(--primary))',
              '&:hover': {
                color: 'hsl(var(--primary))',
              },
            },
            '[class~="lead"]': {
              color: 'hsl(var(--foreground-secondary))',
            },
            strong: {
              color: 'hsl(var(--foreground))',
            },
            'ol > li::marker': {
              color: 'hsl(var(--foreground))',
            },
            'ul > li::marker': {
              color: 'hsl(var(--foreground-secondary))',
            },
            hr: {
              borderColor: 'hsl(var(--border))',
            },
            blockquote: {
              color: 'hsl(var(--foreground))',
              borderLeftColor: 'hsl(var(--border))',
            },
            h1: {
              color: 'hsl(var(--foreground))',
            },
            h2: {
              color: 'hsl(var(--foreground))',
            },
            h3: {
              color: 'hsl(var(--foreground))',
            },
            h4: {
              color: 'hsl(var(--foreground))',
            },
            'figure figcaption': {
              color: 'hsl(var(--foreground-secondary))',
            },
            code: {
              color: 'hsl(var(--foreground))',
            },
            'a code': {
              color: 'hsl(var(--primary))',
            },
            pre: {
              color: 'hsl(var(--foreground))',
              backgroundColor: 'hsl(var(--muted))',
            },
            thead: {
              color: 'hsl(var(--foreground))',
              borderBottomColor: 'hsl(var(--border))',
            },
            'tbody tr': {
              borderBottomColor: 'hsl(var(--border))',
            },
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
    variables:
      Themes[process.env.COSMOSCAN_THEME_KEY as keyof typeof Themes] || {},
  },
  plugins: [
    tailwindAnimate,
    require('@mertasan/tailwindcss-variables'),
    require('@tailwindcss/typography'),
    plugin(({ addComponents }) => {
      addComponents({
        '.font-primary': {
          fontFamily: 'var(--font-inter) var(--font-sans)',
        },
        '.w-h-full': {
          width: '100%',
          height: '100%',
        },
        '.w-h-screen': {
          width: '100vw',
          height: '100vh',
        },
        '.max-w-screen': {
          maxWidth: '100vw',
        },
        '.max-h-screen': {
          maxHeight: '100vh',
        },
        '.flex-c': {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        },
        '.flex-bt-c': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        '.flex-items-c': {
          display: 'flex',
          alignItems: 'center',
        },
        '.flex-truncate': {
          minWidth: '0',
          flex: '1 1 0%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      })
    }),
  ],
}

export default config
