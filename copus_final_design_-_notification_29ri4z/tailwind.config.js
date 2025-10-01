module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: "var(--blue)",
        "button-green": "var(--button-green)",
        "button-green-transparent": "var(--button-green-transparent)",
        "dark-grey": "var(--dark-grey)",
        green: "var(--green)",
        "light-grey": "var(--light-grey)",
        "light-grey-transparent": "var(--light-grey-transparent)",
        "medium-dark-grey": "var(--medium-dark-grey)",
        "medium-grey": "var(--medium-grey)",
        "off-black": "var(--off-black)",
        "orange-dark": "var(--orange-dark)",
        pink: "var(--pink)",
        red: "var(--red)",
        white: "var(--white)",
        yellow: "var(--yellow)",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      boxShadow: { 
        "pop-up": "var(--pop-up)",
        "inputs": "var(--inputs)"
      },
      fontFamily: {
        "h-3": "var(--h-3-font-family)",
        "h-4": "var(--h-4-font-family)",
        "h3-s": "var(--h3-s-font-family)",
        p: "var(--p-font-family)",
        "p-l": "var(--p-l-font-family)",
        "p-lato": "var(--p-lato-font-family)",
        "p-s": "var(--p-s-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [],
  darkMode: ["class"],
};
