const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001/api`;

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const error = new Error(
      (isJson && payload?.error) || `HTTP ${res.status}`
    );
    error.status = res.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export function login(username, password) {
  return request('/sessions', { method: 'POST', body: { username, password } });
}

export function logout() {
  return request('/sessions/current', { method: 'DELETE' });
}

export function getCurrentUser() {
  return request('/sessions/current');
}

export function getHealth() {
  return request('/health');
}

export function getNetwork() {
  return request('/network');
}

export function startGame() {
  return request('/games', { method: 'POST' });
}

export function getRanking() {
  return request('/ranking');
}

const API = { login, logout, getCurrentUser, getHealth, getNetwork, startGame, getRanking };
export default API;
