import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

export const shadcnPreset = {
  darkMode: ["class", ".dark"],
  content: [],
  plugins: [animate],
} satisfies Config
