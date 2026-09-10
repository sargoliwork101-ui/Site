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

import DOMPurify from 'dompurify';

/**
 * 1. Constant-Time String Equality
 * Prevents side-channel timing attacks when checking security keys and OTP tokens.
 *
 * @param {string} a - First string (user input)
 * @param {string} b - Second string (stored hash / secret)
 * @returns {boolean} True if strings are strictly identical
 */
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

  // Allow safe anchor hashes and relative routes
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }

  // Allow safe base64 Data URLs (PDFs, Images, Office Docs)
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:application/pdf') ||
    trimmed.startsWith('data:application/vnd.openxmlformats') ||
    trimmed.startsWith('data:application/msword') ||
    trimmed.startsWith('data:text/') ||
    trimmed.startsWith('blob:')
  ) {
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

export const loginRateLimiter = new RateLimiter(5, 30000, 'admin_login'); // 5 attempts per 30 seconds
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
