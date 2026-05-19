import type { Config } from "tailwindcss";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import daisyui from "daisyui";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
};

export default config;
