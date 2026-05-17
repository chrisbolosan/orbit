/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        void: {
          950: "#050508",
          900: "#0a0a12",
          800: "#10101e",
          700: "#16162a",
          600: "#1e1e36",
          500: "#252542",
        },
        nebula: {
          400: "#7c6aff",
          500: "#6355f5",
          600: "#4f43d4",
        },
        aurora: {
          400: "#34d399",
          500: "#10b981",
        },
        solar: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
        pulsar: {
          400: "#f87171",
          500: "#ef4444",
        },
        comet: {
          300: "#94a3b8",
          400: "#64748b",
          500: "#475569",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          from: { boxShadow: "0 0 10px rgba(124,106,255,0.3)" },
          to: { boxShadow: "0 0 20px rgba(124,106,255,0.6), 0 0 40px rgba(124,106,255,0.2)" },
        },
      },
    },
  },
  plugins: [],
};
