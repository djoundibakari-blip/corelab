/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      // Override Tailwind's blue palette with the brand green palette
      // so all existing blue-* classes automatically map to brand colors
      colors: {
        blue: {
          50:  '#F1F7F6', // Anti-Flash White
          100: '#CCFCE8',
          200: '#AACBC4', // Pistachio
          300: '#2FA98C', // Mint
          400: '#2CC295', // Mountain Meadow
          500: '#17876D', // Frog
          600: '#00DF81', // Caribbean Green  ← primary
          700: '#03624C', // Bangladesh Green ← hover
          800: '#032221', // Dark Green
          900: '#021B1A', // Rich Black
        },
        // Brand colors for explicit use
        brand: {
          black:      '#021B1A',
          dark:       '#032221',
          bangladesh: '#03624C',
          forest:     '#095544',
          meadow:     '#2CC295',
          green:      '#00DF81',
          light:      '#F1F7F6',
          pine:       '#06302B',
          basil:      '#0B453A',
          frog:       '#17876D',
          mint:       '#2FA98C',
          stone:      '#707D7D',
          pistachio:  '#AACBC4',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
