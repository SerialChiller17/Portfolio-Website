/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F1EFE5",
        ink: "#000000",
        panel: "#101010",
        card: "#212121",
        cream: "#F1EFE5",
        gold: "#C59856",
        goldBright: "#DDB877"
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        serif: ['"Instrument Serif"', "serif"]
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      boxShadow: {
        "soft-ring": "0 0 0 1px rgba(241, 239, 229, 0.12)"
      }
    }
  },
  plugins: []
};
