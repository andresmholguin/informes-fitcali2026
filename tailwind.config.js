/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#003091',
        'primary-container': '#0044c4',
        'on-primary': '#ffffff',
        'on-primary-container': '#b1c1ff',
        'inverse-primary': '#b5c4ff',
        'primary-fixed': '#dce1ff',
        'primary-fixed-dim': '#b5c4ff',
        'on-primary-fixed': '#00164e',
        'on-primary-fixed-variant': '#003cae',

        secondary: '#006a68',
        'on-secondary': '#ffffff',
        'secondary-container': '#73f7f3',
        'on-secondary-container': '#00706e',
        'secondary-fixed': '#73f7f3',
        'secondary-fixed-dim': '#52dad6',
        'on-secondary-fixed': '#00201f',
        'on-secondary-fixed-variant': '#00504e',

        tertiary: '#3a3a3a',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#515151',
        'on-tertiary-container': '#c4c4c4',
        'tertiary-fixed': '#e2e2e2',
        'tertiary-fixed-dim': '#c6c6c6',
        'on-tertiary-fixed': '#1b1b1b',
        'on-tertiary-fixed-variant': '#474747',

        surface: '#fbf8ff',
        'surface-dim': '#dad8e8',
        'surface-bright': '#fbf8ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f2ff',
        'surface-container': '#eeecfc',
        'surface-container-high': '#e8e6f6',
        'surface-container-highest': '#e3e1f0',
        'surface-variant': '#e3e1f0',
        'surface-tint': '#0450e1',
        'on-surface': '#1a1b26',
        'on-surface-variant': '#444557',
        'inverse-surface': '#2f2f3b',
        'inverse-on-surface': '#f1efff',

        outline: '#757589',
        'outline-variant': '#c5c5db',

        background: '#fbf8ff',
        'on-background': '#1a1b26',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        success: '#059669',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.25rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        unit: '4px',
        gutter: '24px',
        'margin-page': '40px',
        'sidebar-width': '280px',
        'container-max': '1440px',
      },
      maxWidth: {
        'container-max': '1440px',
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'],
        display: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'title-md': ['18px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      boxShadow: {
        card: '0px 4px 6px -1px rgba(0,0,0,0.05)',
        'card-hover': '0px 8px 16px -2px rgba(0,0,0,0.08)',
        modal: '0px 16px 32px -4px rgba(0,0,0,0.12)',
      },
      animation: {
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
      },
      keyframes: {
        skeleton: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: 0, transform: 'translateX(-16px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
