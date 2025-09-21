import { type Config } from 'tailwindcss'
import { shadcnPreset } from './src/lib/shadcn-preset'

export default {
  presets: [shadcnPreset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config