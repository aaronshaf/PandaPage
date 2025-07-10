import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Include other workspace packages that might use Tailwind classes
    "../renderer-dom/src/**/*.{js,ts,jsx,tsx}",
    "../core/src/**/*.{js,ts,jsx,tsx}",
    "../parser/src/**/*.{js,ts,jsx,tsx}",
    "../renderer-markdown/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Safelist ensures these classes are always included in the CSS
  safelist: [
    // Dynamic margin classes used in renderer-dom
    "ml-0",
    "ml-4",
    "ml-8",
    "ml-12",
    "ml-16",
    "ml-20",
    "ml-24",
    // Arbitrary width values if needed
    "w-[480px]",
    "w-[420px]",
    "w-[360px]",
    "w-[260px]",
    "w-[140px]",
  ],
} satisfies Config;
