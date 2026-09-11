/**
 * ============================================================================
 * NUMBER & DIGIT LOCALIZATION HELPER
 * ============================================================================
 * 
 * Provides robust conversion between Persian (Farsi / Arabic) and English digits
 * and language-aware string formatting for bilingual synchronization.
 *
 * ── فارسی ──
 * سه تابع: toEnglishDigits (ورودی کاربر/اعتبارسنجی)، toPersianDigits (نمایش
 * فارسی اعداد)، formatNum (نمایش شرطی بر اساس زبان). هرجا عدد به کاربر نشون
 * می‌دی از formatNum استفاده کن تا در حالت فارسی ارقام فارسی بشن.
 */

/**
 * Converts all Persian (۰-۹) and Arabic (٠-٩) digits to standard English Latin digits (0-9)
 * @param {string|number} input 
 * @returns {string}
 */
export const toEnglishDigits = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.split(persianDigits[i]).join(String(i));
    result = result.split(arabicDigits[i]).join(String(i));
  }
  return result;
};

/**
 * Converts all English Latin digits (0-9) to Persian digits (۰-۹)
 * @param {string|number} input 
 * @returns {string}
 */
export const toPersianDigits = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
};

/**
 * Automatically formats all numbers inside a string or number based on the current active language.
 * If isFa is false (English mode), converts all Persian digits to English (0-9).
 * If isFa is true (Persian mode), converts all English digits to Persian (۰-۹).
 * 
 * @param {string|number} input
 * @param {boolean} isFa
 * @returns {string}
 */
export const formatNum = (input, isFa) => {
  if (input === null || input === undefined) return '';
  return isFa ? toPersianDigits(input) : toEnglishDigits(input);
};

export default {
  toEnglishDigits,
  toPersianDigits,
  formatNum
};
