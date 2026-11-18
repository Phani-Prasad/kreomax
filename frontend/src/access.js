// Studio access: a code the admin sends to approved students, kept on this device.

const KEY = 'kreomax.access.v1';

export const normalizeCode = (code) => (code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export function getStoredAccess() {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY));
    return v && v.code ? v : null;
  } catch {
    return null;
  }
}

export const hasStoredAccess = () => Boolean(getStoredAccess());

export function saveAccess(access) {
  try { window.localStorage.setItem(KEY, JSON.stringify(access)); } catch { /* private mode: session only */ }
}

export function clearAccess() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

/** Ask the server whether a code is valid. Resolves with { code, name, display } or throws an Error with a friendly message. */
export async function verifyAccess(rawCode) {
  const code = normalizeCode(rawCode);
  if (code.length !== 8) throw Object.assign(new Error('Access codes have 8 characters, like ABCD-2345.'), { status: 400 });
  let res;
  try {
    res = await fetch('/api/access/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  } catch {
    throw Object.assign(new Error('Could not reach the server. Check your connection and try again.'), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = res.status === 429
      ? 'Too many tries. Please wait a minute and try again.'
      : (typeof data.detail === 'string' ? data.detail : 'That code is not valid.');
    throw Object.assign(new Error(message), { status: res.status });
  }
  return { code, name: data.name, display: data.display };
}

/** Sends the access code with every AI request, so the server can tell approved students from everyone else. */
export function installAccessHeader() {
  if (window.__kmxAccessFetch) return;
  window.__kmxAccessFetch = true;
  const original = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.startsWith('/api/ai/')) {
      const stored = getStoredAccess();
      if (stored) {
        const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
        headers.set('X-Access-Code', stored.code);
        return original(input, { ...init, headers });
      }
    }
    return original(input, init);
  };
}
