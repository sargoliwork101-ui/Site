/**
 * ============================================================================
 * SAFE STORAGE (localStorage/sessionStorage with in-memory fallback)
 * ============================================================================
 * Some browsers deny storage access for the whole document (strict tracking
 * prevention, "block all cookies", sandboxed iframes, file:// in some
 * browsers): merely READING `window.localStorage` throws a SecurityError.
 * Every direct call used to crash the app into the ErrorBoundary ("سامانه با
 * خطای بارگذاری مواجه شد"). ALL storage access must go through this module:
 *
 *  - reads/writes fall back to a per-tab in-memory Map when the backend
 *    throws, so the app keeps working (edits/login survive until tab close);
 *  - a `shadow` map covers the readable-but-not-writable case (quota
 *    errors): keys whose write failed keep returning the written value.
 *
 * Use `isPersistentStorageBlocked()` once at boot to warn the user.
 */

function makeSafeStorage(getBackend) {
  const mem = new Map(); // full fallback when the backend is unreadable
  const shadow = new Map(); // keys whose WRITE failed (readable backend, failed write)

  return {
    get(k) {
      if (shadow.has(k)) return shadow.get(k);
      try {
        return getBackend().getItem(k);
      } catch (e) {
        return mem.has(k) ? mem.get(k) : null;
      }
    },
    set(k, v) {
      const val = String(v);
      try {
        getBackend().setItem(k, val);
        shadow.delete(k);
      } catch (e) {
        mem.set(k, val);
        shadow.set(k, val);
      }
    },
    remove(k) {
      shadow.delete(k);
      mem.delete(k);
      try {
        getBackend().removeItem(k);
      } catch (e) {
        /* backend unavailable — memory copy already dropped */
      }
    },
    clear() {
      shadow.clear();
      mem.clear();
      try {
        getBackend().clear();
      } catch (e) {
        /* backend unavailable — memory copy already dropped */
      }
    },
  };
}

// NOTE: the backend is resolved lazily INSIDE try/catch on every call,
// because even `window.localStorage` (the property read itself) throws
// SecurityError when the browser blocks storage for this document.
export const storage = makeSafeStorage(() => window.localStorage);
export const sessionStore = makeSafeStorage(() => window.sessionStorage);

/**
 * True when the browser blocks persistent storage for this document.
 * Call once at boot to explain degraded persistence to the user.
 */
export function isPersistentStorageBlocked() {
  try {
    window.localStorage.getItem('__storage_probe__');
    return false;
  } catch (e) {
    return true;
  }
}
