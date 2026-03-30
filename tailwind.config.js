/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border:     "var(--color-border)",
        input:      "var(--color-border)",
        ring:       "var(--color-primary)",
        background: "var(--color-bg-main)",
        foreground: "var(--color-text-primary)",
        primary: {
          DEFAULT:    "var(--color-primary)",
          foreground: "#FFFFFF",
        },
        sidebar: {
          DEFAULT:    "var(--color-bg-sidebar)",
          foreground: "var(--color-text-primary)",
        },
        card: {
          DEFAULT:    "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
        popover: {
          DEFAULT:    "var(--color-bg-card)",
          foreground: "var(--color-text-primary)",
        },
        accent: {
          DEFAULT:    "var(--color-primary-soft)",
          foreground: "var(--color-primary)",
        },
        muted: {
          DEFAULT:    "var(--color-table-header)",
          foreground: "var(--color-text-secondary)",
        },
        success: "var(--color-success)",
        danger:  "var(--color-danger)",
        warning: "var(--color-warning)",
      },
      fontFamily: {
        sans:    ['"Inter"', "sans-serif"],
        heading: ['"Inter"', "sans-serif"],
        body:    ['"Inter"', "sans-serif"],
      },
      borderRadius: {
        card:   "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
