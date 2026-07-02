import { create } from 'zustand';
import { login as loginApi, getMe as getMeApi, logout as logoutApi } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false, // FIX: was 'true' which caused the Sign In button to appear stuck immediately
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await loginApi(email, password);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        set({ user: res.data.user, loading: false });
        return true;
      }
      set({ loading: false });
      return false;
    } catch (err) {
      set({ 
        error: err.response?.data?.message || 'Login failed. Please try again.', 
        loading: false 
      });
      return false;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const res = await getMeApi();
      if (res.success) {
        set({ user: res.data, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ user: null, loading: false });
    }
  },
}));
