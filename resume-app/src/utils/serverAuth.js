/**
 * ============================================================================
 * SERVER AUTH CLIENT — talks to the real PHP backend (api/*.php) when the
 * site runs on real hosting. All URLs are RELATIVE so subdirectory installs
 * work without any configuration.
 * ============================================================================
 *
 * Backend contract (see public/api/*.php):
 *   GET  api/auth.php?action=status   → {backend:true, setupDone, authenticated, ...}
 *   POST api/auth.php?action=<action> → {ok:true,...} | {ok:false,error,...}
 *   POST api/contact.php              → {ok:true} | {ok:false,error,...}
 *
 * When the backend is missing (static preview, file://, GitHub Pages) every
 * call fails gracefully with {ok:false, error:'no_backend'} and the app runs
 * in clearly-labeled LOCAL mode.
 *
 * @module serverAuth
 */

const AUTH_URL = 'api/auth.php';
const CONTACT_URL = 'api/contact.php';
const UPLOAD_URL = 'api/upload.php';
const REQUEST_TIMEOUT_MS = 20000;

async function postForm(url, action, body = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') {
      // Static server / missing backend serves HTML instead of JSON.
      return { ok: false, error: res.ok ? 'no_backend' : `http_${res.status}` };
    }
    if (data.ok === true) return data;
    return { ok: false, error: data.error || `http_${res.status}`, retryAfter: data.retryAfter || 0 };
  } catch (e) {
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

async function postContact(payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(CONTACT_URL, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') {
      return { ok: false, error: res.ok ? 'no_backend' : `http_${res.status}` };
    }
    if (data.ok === true) return data;
    return { ok: false, error: data.error || `http_${res.status}`, retryAfter: data.retryAfter || 0 };
  } catch (e) {
    return { ok: false, error: 'network' };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Probe the backend. NEVER throws.
 * @returns {Promise<{available, setupDone, authenticated, mailAvailable, emailVerified}>}
 */
export async function fetchServerStatus() {
  const offline = {
    available: false,
    setupDone: false,
    authenticated: false,
    mailAvailable: false,
    emailVerified: false,
  };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let res;
    try {
      res = await fetch(`${AUTH_URL}?action=status`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => null);
    if (!data || data.backend !== true) return offline;
    return {
      available: true,
      setupDone: data.setupDone === true,
      authenticated: data.authenticated === true,
      mailAvailable: data.mailAvailable !== false,
      emailVerified: data.emailVerified === true,
    };
  } catch (e) {
    return offline;
  }
}

// --- First-run setup ---------------------------------------------------------
export const serverSetup = (password, recoveryEmail) =>
  postForm(AUTH_URL, 'setup', { password, recoveryEmail });

export const serverVerifySetupOtp = (otp) =>
  postForm(AUTH_URL, 'verify-setup-otp', { otp: String(otp || '') });

export const serverSkipSetupVerify = () =>
  postForm(AUTH_URL, 'skip-setup-verify', {});

// --- Sessions ----------------------------------------------------------------
export const serverLogin = (username, password) =>
  postForm(AUTH_URL, 'login', { username, password });

export const serverLogout = () =>
  postForm(AUTH_URL, 'logout', {});

// --- Password recovery (REAL server-side OTP) --------------------------------
export const serverRequestOtp = (email) =>
  postForm(AUTH_URL, 'request-otp', { email });

export const serverVerifyOtp = (email, otp) =>
  postForm(AUTH_URL, 'verify-otp', { email, otp: String(otp || '') });

export const serverResetPassword = (token, newPassword) =>
  postForm(AUTH_URL, 'reset-password', { token, newPassword });

// --- Authenticated account management ----------------------------------------
export const serverChangePassword = (currentPassword, newPassword) =>
  postForm(AUTH_URL, 'change-password', { currentPassword, newPassword });

export const serverRequestEmailChange = (password, newEmail) =>
  postForm(AUTH_URL, 'request-email-change', { password, newEmail });

export const serverConfirmEmailChange = (otp) =>
  postForm(AUTH_URL, 'confirm-email-change', { otp: String(otp || '') });

export const serverAccount = () =>
  postForm(AUTH_URL, 'account', {});

// --- Notification mailbox (SMTP lives on the server; password never in git) ---
export const serverSmtpGet = () =>
  postForm(AUTH_URL, 'smtp-get', {});

export const serverSmtpSave = (cfg) =>
  postForm(AUTH_URL, 'smtp-save', cfg || {});

export const serverSmtpReveal = () =>
  postForm(AUTH_URL, 'smtp-reveal', {});

export const serverSmtpTest = () =>
  postForm(AUTH_URL, 'smtp-test', {});

// --- Server backups (auto-backup target lives on the HOST) --------------------
export const serverBackupSave = (backup) =>
  postForm(AUTH_URL, 'backup-save', { backup });

export const serverBackupList = () =>
  postForm(AUTH_URL, 'backup-list', {});

export const serverBackupGet = (name) =>
  postForm(AUTH_URL, 'backup-get', { name });

export const serverBackupDelete = (name) =>
  postForm(AUTH_URL, 'backup-delete', { name });

export const serverBackupConfigGet = () =>
  postForm(AUTH_URL, 'backup-config-get', {});

export const serverBackupConfigSave = (keep) =>
  postForm(AUTH_URL, 'backup-config-save', { keep });

// --- Contact ------------------------------------------------------------------
/**
 * Upload a contact-form attachment. Returns { ok, url?, error? }.
 * NOTE: no manual Content-Type — the browser sets the multipart boundary.
 */
export async function serverUploadAttachment(file) {
  try {
    const fd = new FormData();
    fd.append('attachment', file, file.name);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 60000);
    let res;
    try {
      res = await fetch(UPLOAD_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: fd,
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const data = await res.json().catch(() => null);
    if (data && data.ok === true && typeof data.url === 'string') {
      return { ok: true, url: data.url };
    }
    return { ok: false, error: (data && data.error) || ('http_' + res.status) };
  } catch (e) {
    return { ok: false, error: 'network' };
  }
}

export const serverContact = (payload) =>
  postContact(payload);
