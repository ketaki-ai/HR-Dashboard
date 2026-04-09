/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0f",
        surface: "#111318",
        surface2: "#181b23",
        accent: "#c8f135",
        accent2: "#7c5cf6",
        accent3: "#f1a535",
        accent4: "#35d9f1",
        rejected: "#ff4d6d",
        border: "rgba(255,255,255,0.07)",
        muted: "#6b7280",
        muted2: "#9ca3af",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        dm: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      animation: {
        "fade-up": "fadeUp 0.35s ease forwards",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
