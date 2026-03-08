/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0B0F14',
          card: '#151B23',
          'card-hover': '#1A2330',
          border: '#1E2733',
          accent: '#C0C0C0',
          'accent-hover': '#E5E5E5',
          'accent-dim': 'rgba(192,192,192,0.15)',
          secondary: '#3BD2FF',
          'secondary-dim': 'rgba(59,210,255,0.12)',
          text: '#E9EEF5',
          muted: '#7E8A98',
          'muted-dark': '#4A5568',
          success: '#22D3A5',
          danger: '#FF4D6A',
          warning: '#FFB547',
          glow: 'rgba(192,192,192,0.3)',
          'glow-blue': 'rgba(59,210,255,0.25)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'vault-gradient': 'linear-gradient(135deg, #0B0F14 0%, #0F1520 50%, #0B0F14 100%)',
        'card-gradient': 'linear-gradient(135deg, #151B23 0%, #1A2330 100%)',
        'accent-gradient': 'linear-gradient(135deg, #C0C0C0 0%, #E5E5E5 50%, #F5F5F5 100%)',
        'secondary-gradient': 'linear-gradient(135deg, #3BD2FF 0%, #1BA8FF 100%)',
        'glow-radial': 'radial-gradient(ellipse at center, rgba(192,192,192,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'vault': '0 0 0 1px rgba(192,192,192,0.2), 0 8px 32px rgba(0,0,0,0.4)',
        'vault-hover': '0 0 0 1px rgba(192,192,192,0.4), 0 12px 48px rgba(0,0,0,0.5)',
        'vault-glow': '0 0 30px rgba(192,192,192,0.25), 0 0 60px rgba(192,192,192,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(192,192,192,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.08)',
        'blue-glow': '0 0 30px rgba(59,210,255,0.2), 0 0 60px rgba(59,210,255,0.08)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'vault-spin': 'vaultSpin 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(192,192,192,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(192,192,192,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        vaultSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
