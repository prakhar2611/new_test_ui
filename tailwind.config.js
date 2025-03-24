/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",    // Blue
        secondary: "#10B981",  // Green
        accent: "#F59E0B",     // Orange
        background: {
          light: "#FFFFFF",
          dark: "#1F2937"
        },
        text: {
          light: "#111827",
          dark: "#F9FAFB"
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace"]
      },
      spacing: {
        base: "4px",
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "32px",
        xl: "48px"
      }
    },
  },
  plugins: [],
} 