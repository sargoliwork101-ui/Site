/**
 * postcss.config.js — زنجیره پردازش CSS (فقط Tailwind + autoprefixer).
 * معمولاً هیچ‌وقت لازم نیست بازش کنی؛ اگه بیلد CSS خراب شد این‌جا رو چک کن.
 */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
