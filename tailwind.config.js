export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        farm: {
          night: "#06110b",
          panel: "rgba(6, 17, 11, 0.74)",
          line: "rgba(208, 255, 214, 0.14)",
          accent: "#77f08d"
        }
      },
      boxShadow: {
        panel: "0 20px 45px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
};
