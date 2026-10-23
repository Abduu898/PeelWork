const SESSION_KEY = 'hireloop_session';
const USER_KEY = 'hireloop_user';

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    clearSession();
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function authHeaders(headers = {}) {
  const token = getToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export function saveSession(token, user) {
  localStorage.setItem(SESSION_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function logout() {
  const token = getToken();
  try {
    if (token) await fetch('/auth/logout', { method: 'POST', headers: authHeaders() });
  } finally {
    clearSession();
  }
}

export function dashboardFor(user) {
  if (user?.role === 'super_admin') return 'super-admin.html';
  if (user?.role === 'company_admin') return 'admin.html';
  if (user?.role === 'candidate') return 'candidate-dashboard.html';
  return 'login.html';
}
