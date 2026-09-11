/**
 * ============================================================================
 * SECURITY UTILITIES & DEFENSE SUITE (Computer Engineering Grade)
 * ============================================================================
 * 
 * This module provides comprehensive security mechanisms for client-side
 * input sanitization, timing-safe equality, anti-brute-force rate limiting,
 * safe file downloads, and cryptographic OTP generation for admin recovery.
 *
 * @module security
 */

/**
 * ── راهنمای فارسی: نقشه این فایل ──
 * جعبه‌ابزار امنیت فرانت. هر تابع کجا به کار میاد:
 *   sanitizeText / sanitizeRichHtml → تمیزکاری متن ساده / HTML غنی (قبل از نمایش)
 *   sanitizeUrl (v2) → تنها راه امن برای href داینامیک؛ javascript:/data:text
 *     رو می‌بنده ولی آدرس نسبی هاست (uploads/...) رو قبول می‌کنه
 *   validateEmail / sanitizeFileName / validateUploadFile → اعتبارسنجی ورودی و آپلود
 *   sanitizeBackupPayload → ضد prototype-pollution برای فایل بک‌آپ ورودی
 *   sanitizeSvgDataUrl → پاک‌سازی اسکریپت داخل SVG آپلودشده
 *   triggerSafeDownload → دانلود امن فایل (⚠️ فقط Blob یا URL پاس بده، نه آبجکت!)
 *   uniqueId → ساخت آی‌دی یکتای ضدتصادم برای آیتم‌های جدید (به‌جای Date.now خالی)
 *   timingSafeEqual / hashPasswordLocal / verifyPasswordLocal → احراز هویت محلی
 *   RateLimiter + سه نمونه آماده → ضد brute-force لاگین/تماس/OTP (سمت سرور هم هست)
 *   copyTextToClipboard → کپی مطمئن با fallback برای هاست بدون HTTPS
 * ⚠️ قانون طلایی: هیچ تصمیم امنیتی نهایی این‌جا گرفته نمی‌شه — در حالت امن،
 * سرور (PHP) مرجعه. این توابع فقط لایه دفاعی اول فرانت هستن.
 */

import DOMPurify from 'dompurify';

/**
 * 1. Constant-Time String Equality
 * Prevents side-channel timing attacks when checking security keys and OTP tokens.
 *
 * @param {string} a - First string (user input)
 * @param {string} b - Second string (stored hash / secret)
 * @returns {boolean} True if strings are strictly identical
 */
/**
 * Collision-proof client ID (`board-lxyz-1a2b3c`). Bare Date.now() IDs collide
 * when two items are created within the same millisecond (double-Enter /
 * double-click) — React key dupes + wrong-item updates/deletes follow.
 * Monotonic per-tab counter + ms time + random suffix: unique every call.
 */
let __uidSeq = 0;
export const uniqueId = (prefix) => {
  __uidSeq += 1;
  const rand = Math.floor(Math.random() * 46656).toString(36);
  return `${prefix}-${Date.now().toString(36)}-${__uidSeq.toString(36)}${rand}`;
};

export const timingSafeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch = mismatch | (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  return mismatch === 0;
};

/**
 * 2. Cryptographic Numeric OTP Generator (for Admin Password Recovery & Email Verification)
 * Generates a 6-digit cryptographically random numeric string.
 *
 * @param {number} length - Desired OTP length (default: 6)
 * @returns {string} Numeric OTP string
 */
export const generateSecureOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(length);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      otp += digits[values[i] % digits.length];
    }
  } else {
    // Fallback pseudo-random generator
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
  }
  return otp;
};

/**
 * 3. Sanitize Plain Text against XSS & HTML Injection
 * Strips raw HTML tags, script protocols, and invisible control characters.
 *
 * @param {string} input - Raw user text input
 * @returns {string} Clean, safe text string
 */
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Strip raw angle brackets
    .replace(/javascript:/gi, '') // Strip javascript pseudo-protocol
    .replace(/vbscript:/gi, '') // Strip vbscript pseudo-protocol
    .replace(/on\w+=/gi, '') // Strip inline event handlers
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // Strip ASCII control codes
    .trim();
};

/**
 * 4. Safe URL Validator
 * Permits only safe schemes (https, http, mailto, tel, anchor hashes, and safe base64/blob URIs).
 *
 * @param {string} url - Target URL to inspect
 * @param {string} fallback - Fallback URL if invalid (default: '#')
 * @returns {string} Safe validated URL
 */
export const sanitizeUrl = (url, fallback = '#') => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  // Bare `//evil.com/x` is a protocol-relative navigation, NOT a safe path.
  if (trimmed.startsWith('//')) return fallback;

  // Allow safe anchor hashes and root-relative routes (no backslash tricks:
  // browsers read `/\evil.com` as protocol-relative too).
  if (trimmed.startsWith('#') || (trimmed.startsWith('/') && !trimmed.includes('\\'))) {
    return trimmed;
  }

  // Allow safe base64 Data URLs (PDFs, Images, Office Docs) and blob: URLs.
  // NOTE: `data:text/*` is deliberately NOT allowed — `data:text/html,<script>`
  // navigates to attacker-controlled script (nothing in the app uses data:text/).
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:application/pdf') ||
    trimmed.startsWith('data:application/vnd.openxmlformats') ||
    trimmed.startsWith('data:application/msword') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Allow bare-relative app paths (`uploads/contact/x.pdf`, `api/upload.php`,
  // `files/doc.pdf`) — the PHP backend returns these. Safe iff there is NO
  // scheme separator (kills `javascript:`/`data:`/every scheme trick), no
  // backslash, and no HTML-breaking / control characters.
  // eslint-disable-next-line no-control-regex
  if (!trimmed.includes(':') && !trimmed.includes('\\') && !/["'`<>\u0000-\u001F\u007F]/.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return trimmed;
    }
  } catch (e) {
    if (/^(https?|mailto|tel):/i.test(trimmed)) {
      return trimmed;
    }
  }

  return fallback;
};

/**
 * 5. Strict ReDoS-Safe Email Validator
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is structurally valid
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
};

/**
 * 6. Safe Filename Sanitizer
 * Mitigates Path Traversal (../) and Remote Code Execution by renaming executable extensions.
 *
 * @param {string} fileName - Original filename
 * @returns {string} Sanitized filename
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return `file_${Date.now()}`;

  let safe = fileName
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/\0/g, '')
    .replace(/[^a-zA-Z0-9._\-\u0600-\u06FF]/g, '_');

  const dangerousExtensions = [
    '.exe', '.php', '.phtml', '.sh', '.bat', '.cmd', '.jsp', '.asp', '.aspx', '.cgi', '.pl', '.py', '.js', '.vbs', '.msi'
  ];
  for (const ext of dangerousExtensions) {
    if (safe.toLowerCase().endsWith(ext)) {
      safe = safe + '.txt';
    }
  }

  return safe || `file_${Date.now()}`;
};

/**
 * 7. File Upload Security Validation (Size & MIME Whitelisting)
 *
 * @param {File} file - File object from input
 * @param {object} options - Validation options (maxSizeMB, allowedMimeTypes)
 * @returns {{valid: boolean, error?: string}}
 */
export const validateUploadFile = (file, options = {}) => {
  const {
    maxSizeMB = 25,
    allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/epub+zip',
      'text/plain',
      'text/markdown',
      'text/html'
    ],
  } = options;

  if (!file) {
    return { valid: false, error: 'فایلی انتخاب نشده است.' };
  }

  // Size Check
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `حجم فایل (${(file.size / (1024 * 1024)).toFixed(1)}MB) بیش از حد مجاز (${maxSizeMB}MB) است.`,
    };
  }

  // Check MIME Type or valid document / CAD 3D extension
  const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
  const allowedExts = [
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.docx', '.doc', '.epub', '.txt', '.md', '.html',
    '.step', '.stp', '.glb', '.gltf', '.obj', '.zip'
  ];

  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type.toLowerCase())) {
    if (!allowedExts.includes(fileExt)) {
      return {
        valid: false,
        error: 'فرمت فایل مجاز نیست! فرمت‌های مجاز: PDF, STEP (.step/.stp), 3D GLB/OBJ, DOCX, ZIP گربر و تصاویر.',
      };
    }
  }

  return { valid: true };
};

/**
 * 8. Prototype Pollution & Deep JSON Sanitizer
 * Cleans object trees from dangerous prototype override keys (__proto__, constructor, prototype).
 *
 * @param {any} obj - Input object / payload
 * @param {number} depth - Recursion guard depth
 * @returns {any} Sanitized object
 */
export const sanitizeBackupPayload = (obj, depth = 0) => {
  if (depth > 16 || !obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeBackupPayload(item, depth + 1));
  }

  const clean = Object.create(null);
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    clean[key] = sanitizeBackupPayload(obj[key], depth + 1);
  }
  return { ...clean };
};

/**
 * 9. High-Security Rich HTML Content Sanitizer with DOMPurify & Defense-in-Depth
 *
 * @param {string} html - Raw HTML from rich text editor
 * @returns {string} Sanitized XSS-free HTML
 */
export const sanitizeRichHtml = (html) => {
  if (!html || typeof html !== 'string') return '';

  try {
    const purifyInstance = typeof DOMPurify?.sanitize === 'function' 
      ? DOMPurify 
      : (DOMPurify?.default && typeof DOMPurify.default.sanitize === 'function' ? DOMPurify.default : null);

    if (purifyInstance) {
      return purifyInstance.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup',
          'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'span', 'div', 'a', 'img', 'mark'
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style', 'width', 'height', 'dir', 'align'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$)|data:image\/)/i,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
        ADD_ATTR: ['target', 'rel'],
      });
    }
  } catch (e) {
    // Fall through to regex sanitization
  }

  // Fallback Defense-in-Depth Sanitizer
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '');
};

/**
 * 10. Rate Limiter Class (Protects Against Brute-Force & Flooding)
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 30000, storageKey = null) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.storageKey = storageKey;
    this.attempts = this.loadAttempts();
  }

  loadAttempts() {
    if (!this.storageKey) return [];
    try {
      const saved = sessionStorage.getItem(`rl_${this.storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        return Array.isArray(parsed) ? parsed.filter((ts) => now - ts < this.windowMs) : [];
      }
    } catch (e) {}
    return [];
  }

  saveAttempts() {
    if (!this.storageKey) return;
    try {
      sessionStorage.setItem(`rl_${this.storageKey}`, JSON.stringify(this.attempts));
    } catch (e) {}
  }

  canAttempt() {
    const now = Date.now();
    this.attempts = this.attempts.filter((ts) => now - ts < this.windowMs);
    this.saveAttempts();
    return this.attempts.length < this.maxAttempts;
  }

  recordAttempt() {
    this.attempts.push(Date.now());
    this.saveAttempts();
  }

  getRemainingCooldownSeconds() {
    if (this.attempts.length < this.maxAttempts) return 0;
    const oldest = this.attempts[0];
    const diff = this.windowMs - (Date.now() - oldest);
    return Math.max(0, Math.ceil(diff / 1000));
  }

  reset() {
    this.attempts = [];
    if (this.storageKey) {
      try {
        sessionStorage.removeItem(`rl_${this.storageKey}`);
      } catch (e) {}
    }
  }
}

export const loginRateLimiter = new RateLimiter(3, 30000, 'admin_login'); // 3-strikes UX mirror (server enforces the real lockout)
export const contactRateLimiter = new RateLimiter(3, 60000, 'contact_form'); // 3 submissions per minute
export const otpRateLimiter = new RateLimiter(3, 60000, 'otp_requests'); // 3 OTP requests per minute

/**
 * 11. Safe Memory-Leak-Free File Download Trigger
 *
 * @param {Blob|string} blobOrUrl - Blob or object URL
 * @param {string} fileName - Destination filename
 */
export const triggerSafeDownload = (blobOrUrl, fileName) => {
  const safeName = sanitizeFileName(fileName);
  let url = blobOrUrl;
  let isCreatedObjectUrl = false;

  if (blobOrUrl instanceof Blob) {
    url = URL.createObjectURL(blobOrUrl);
    isCreatedObjectUrl = true;
  }

  const link = document.createElement('a');
  link.href = sanitizeUrl(url);
  link.download = safeName;
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isCreatedObjectUrl) {
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 2000);
  }
};

/**
 * 12. Local-Mode Password Hashing (PBKDF2-SHA256 via WebCrypto)
 * ---------------------------------------------------------------------------
 * Used ONLY when the site runs WITHOUT the PHP backend (static preview /
 * offline testing). On real hosting, passwords are bcrypt-hashed SERVER-side
 * and never touch the browser. Local hashes just protect against casual
 * shoulder-surfing of localStorage — they are NOT a substitute for the
 * backend.
 *
 * Format: pbkdf2$<iterations>$<saltHex>$<hashHex>
 */

// OWASP Password Storage Cheat Sheet (2023): PBKDF2-HMAC-SHA-256 → 600,000
// iterations. Old hashes keep verifying (count is stored in the string) and
// are transparently upgraded on the next successful login (see below).
const PBKDF2_ITERATIONS = 600000;

const bytesToHex = (bytes) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

const hexToBytes = (hex) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
};

export const isLocalPasswordHash = (value) =>
  typeof value === 'string' && value.startsWith('pbkdf2$');

/**
 * True when a stored credential should be re-hashed with current settings
 * after the next successful verification (legacy plaintext, fallback hash,
 * or PBKDF2 with fewer than the current iteration count).
 */
export const needsLocalRehash = (stored) => {
  if (!isLocalPasswordHash(stored)) return true;
  const iter = parseInt(String(stored).split('$')[1], 10);
  return !iter || iter < PBKDF2_ITERATIONS;
};

export const hasWebCrypto = () =>
  typeof window !== 'undefined' &&
  !!window.crypto &&
  !!window.crypto.subtle &&
  typeof window.crypto.subtle.importKey === 'function';

/**
 * Plain-HTTP fallback stretcher (salted + stretched cyrb53). NOT
 * cryptographic — but opaque, deterministic, and verifiable, so local-mode
 * logins keep working where WebCrypto is unavailable. BYTE-IDENTICAL to the
 * original inline loop: previously-stored `simple$` values MUST keep verifying.
 */
const fallbackStretchHex = (salt, pw, rounds = 20000) => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  const str = `${salt}:${pw}`;
  for (let round = 0; round < rounds; round++) {
    const s = round === 0 ? str : `${h1.toString(16)}${h2.toString(16)}:${str}`;
    h1 = 0xdeadbeef;
    h2 = 0x41c6ce57;
    for (let i = 0; i < s.length; i++) {
      const ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  }
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
};

/**
 * Hash a password for local-mode storage. Falls back to a salted,
 * stretched non-crypto hash ONLY when WebCrypto is unavailable (plain-HTTP
 * origins) — still far better than plaintext.
 */
export async function hashPasswordLocal(password) {
  const pw = String(password || '');
  if (hasWebCrypto()) {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    const bits = await window.crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      key,
      256
    );
    return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(bits))}`;
  }
  // No-secure-context fallback: salted + stretched cyrb53 (NOT cryptographic,
  // but opaque). Local/testing mode only. NOTE: getRandomValues works even on
  // plain HTTP (only `subtle` is gated), so the salt stays cryptographic.
  let salt = '';
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      salt = bytesToHex(window.crypto.getRandomValues(new Uint8Array(16)));
    }
  } catch (e) { /* fall through */ }
  if (!salt) salt = Math.floor(Math.random() * 0xffffffff).toString(16);
  return `simple$20000$${salt}$${fallbackStretchHex(salt, pw, 20000)}`;
}

/**
 * Verify a password against a local-mode stored value. Transparently accepts
 * legacy PLAINTEXT values (returns true on match) so old installs can migrate
 * on next successful login.
 */
export async function verifyPasswordLocal(password, stored) {
  const pw = String(password || '');
  if (typeof stored !== 'string' || stored === '') return false;

  if (isLocalPasswordHash(stored)) {
    if (!hasWebCrypto()) return false; // cannot verify PBKDF2 without subtle
    try {
      const [, iterStr, saltHex, hashHex] = stored.split('$');
      const iterations = parseInt(iterStr, 10);
      if (!iterations || !saltHex || !hashHex) return false;
      const enc = new TextEncoder();
      const key = await window.crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      const bits = await window.crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: hexToBytes(saltHex), iterations, hash: 'SHA-256' },
        key,
        256
      );
      return timingSafeEqual(bytesToHex(new Uint8Array(bits)), hashHex);
    } catch (e) {
      return false;
    }
  }

  if (stored.startsWith('simple$')) {
    // No-secure-context fallback hash: re-compute and compare. Rounds are
    // capped so a tampered localStorage value cannot DoS the login button.
    try {
      const [, roundsStr, salt, hashHex] = stored.split('$');
      const rounds = parseInt(roundsStr, 10);
      if (!rounds || rounds < 1 || rounds > 50000 || !salt || !hashHex) return false;
      return timingSafeEqual(fallbackStretchHex(salt, pw, rounds), hashHex);
    } catch (e) {
      return false;
    }
  }

  // Legacy plaintext (pre-hardening installs) — migrate after success.
  return timingSafeEqual(pw, stored);
}

/**
 * 13. SVG Upload Sanitizer (defense-in-depth against stored script in SVG)
 * ---------------------------------------------------------------------------
 * Uploaded SVGs are stored as data: URLs and rendered via <img> (where
 * scripts cannot run) — this strips scripts anyway so a saved file can never
 * execute even if opened directly.
 *
 * @param {string} dataUrl - readAsDataURL() result
 * @returns {string} Sanitized data URL (or the original when N/A)
 */
export const sanitizeSvgDataUrl = (dataUrl) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }
  try {
    const comma = dataUrl.indexOf(',');
    if (comma < 0) return dataUrl;
    const meta = dataUrl.slice(0, comma);
    const payload = dataUrl.slice(comma + 1);
    const isBase64 = meta.includes(';base64');
    const svgText = isBase64 ? decodeURIComponent(escape(atob(payload))) : decodeURIComponent(payload);

    const purifyInstance = typeof DOMPurify?.sanitize === 'function'
      ? DOMPurify
      : (DOMPurify?.default && typeof DOMPurify.default.sanitize === 'function' ? DOMPurify.default : null);
    if (!purifyInstance) return dataUrl;

    const clean = purifyInstance.sanitize(svgText, {
      USE_PROFILES: { svg: true },
      FORBID_TAGS: ['script', 'foreignObject', 'animate', 'set', 'handler'],
      FORBID_ATTR: ['onbegin', 'onend', 'onrepeat'],
    });
    if (!clean || !clean.includes('<svg')) return dataUrl;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(clean)))}`;
  } catch (e) {
    return dataUrl;
  }
};

/**
 * Copy text to the clipboard RELIABLY. Modern async clipboard first, with a
 * textarea + execCommand fallback for insecure contexts / older browsers
 * (where navigator.clipboard is undefined and a bare writeText call throws).
 * @param {string} text
 * @returns {Promise<boolean>} true on success, false on failure/empty
 */
export async function copyTextToClipboard(text) {
  const str = String(text ?? '');
  if (!str) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch (e) { /* fall through to the legacy path */ }
  try {
    if (typeof document === 'undefined') return false;
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok === true;
  } catch (e) {
    return false;
  }
}
