import Cookies from 'js-cookie';

export const saveAuthTokens = (accessToken: string, refreshToken?: string) => {
  if (typeof window === 'undefined') return;

  // LocalStorage for client-side axios + guards
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

  // Cookie for middleware/SSR checks (non-HttpOnly; fine for dev)
  Cookies.set('accessToken', accessToken, {
    sameSite: 'lax',
    // secure: true, // uncomment if serving over HTTPS
    path: '/',
  });
};

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  Cookies.remove('accessToken', { path: '/' });
};

export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};
