/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--md-sys-color-background)",
        surface: {
          DEFAULT: "var(--md-sys-color-surface)",
          dim: "var(--md-sys-color-surface-dim)",
          bright: "var(--md-sys-color-surface-bright)",
          variant: "var(--md-sys-color-surface-variant)",
          "container-lowest": "var(--md-sys-color-surface-container-lowest)",
          "container-low": "var(--md-sys-color-surface-container-low)",
          container: "var(--md-sys-color-surface-container)",
          high: "var(--md-sys-color-surface-container-high)",
          highest: "var(--md-sys-color-surface-container-highest)",
        },
        "on-surface": "var(--md-sys-color-on-surface)",
        "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
        outline: {
          DEFAULT: "var(--md-sys-color-outline)",
          variant: "var(--md-sys-color-outline-variant)",
        },
        primary: {
          DEFAULT: "var(--md-sys-color-primary)",
          container: "var(--md-sys-color-primary-container)",
          inverse: "var(--md-sys-color-inverse-primary)",
        },
        "on-primary": "var(--md-sys-color-on-primary)",
        "on-primary-container": "var(--md-sys-color-on-primary-container)",
        secondary: {
          DEFAULT: "var(--md-sys-color-secondary)",
          container: "var(--md-sys-color-secondary-container)",
        },
        "on-secondary": "var(--md-sys-color-on-secondary)",
        "on-secondary-container": "var(--md-sys-color-on-secondary-container)",
        tertiary: {
          DEFAULT: "var(--md-sys-color-tertiary)",
          container: "var(--md-sys-color-tertiary-container)",
        },
        "on-tertiary": "var(--md-sys-color-on-tertiary)",
        "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
        error: {
          DEFAULT: "var(--md-sys-color-error)",
          container: "var(--md-sys-color-error-container)",
        },
        "on-error": "var(--md-sys-color-on-error)",
        "on-error-container": "var(--md-sys-color-on-error-container)",
        "surface-tint": "var(--md-sys-color-surface-tint)",
      },
      fontFamily: {
        sans: [
          "Geist Variable",
          "Geist",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      spacing: {
        gutter: "24px",
        section: "96px",
        "section-lg": "160px",
      },
      boxShadow: {
        glow: "0 8px 32px rgba(16, 185, 129, 0.25)",
        "glow-strong": "0 0 24px rgba(16, 185, 129, 0.4)",
      },
    },
  },
  plugins: [],
};