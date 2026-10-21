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
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
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
        DEFAULT: "4px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "10px",
      },
      spacing: {
        gutter: "24px",
        section: "96px",
        "section-lg": "160px",
      },
      boxShadow: {
        glow: "0 0 24px rgba(82, 224, 138, 0.15)",
        "glow-strong": "0 0 32px rgba(82, 224, 138, 0.30)",
      },
    },
  },
  plugins: [],
};