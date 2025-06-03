import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginResponse, User } from '../types/authTypes';

interface AuthState {
  token: string | null;
  user: User | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      login: (data: LoginResponse) => set({ token: data.access_token, user: data.user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'auth', // storage key
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
