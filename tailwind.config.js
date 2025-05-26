/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Zwarm Yellow Palette
        yellow: {
          DEFAULT: '#FFD600',
          50: '#FFFEF0',
          100: '#FFFBE6',
          200: '#FFF4B8',
          300: '#FFED8A',
          400: '#FFE55C',
          500: '#FFD600', // Main brand yellow
          600: '#FFB800',
          700: '#E6A500',
          800: '#B8850A',
          900: '#8A6508',
        },
        
        // Zwarm Dark Palette
        black: {
          DEFAULT: '#0A0A0A',
          50: '#F5F5F5',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#1A1A1A',
          950: '#0A0A0A', // Deepest black
        },
        
        // Zwarm Gray Palette
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          950: '#030712',
        },
        
        // Zwarm Blue (for CTAs and highlights)
        blue: {
          DEFAULT: '#60A5FA',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA', // Main blue
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
      },
      
      fontFamily: {
        'inter': ['var(--font-inter)', 'sans-serif'],
      },
      
      // Custom spacing for consistent design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom border radius
      borderRadius: {
        'zwarm': '20px',
        'zwarm-sm': '12px',
        'zwarm-lg': '28px',
      },
      
      // Custom shadows
      boxShadow: {
        'zwarm': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
        'zwarm-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'zwarm-glow': '0 0 20px 0 rgba(255, 214, 0, 0.15)',
        'zwarm-glow-strong': '0 0 30px 0 rgba(255, 214, 0, 0.3)',
      },
      
      // Custom backdrop blur
      backdropBlur: {
        'zwarm': '16px',
      },

      // Add keyframes for animations
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(40px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        bounce: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-12px)',
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px) rotate(0deg)",
            opacity: "0.08",
          },
          "25%": {
            transform: "translateY(-10px) rotate(2deg)",
            opacity: "0.12",
          },
          "50%": {
            transform: "translateY(-20px) rotate(0deg)",
            opacity: "0.15",
          },
          "75%": {
            transform: "translateY(-10px) rotate(-2deg)",
            opacity: "0.12",
          },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
        bounce: 'bounce 2.2s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55)',
       float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
