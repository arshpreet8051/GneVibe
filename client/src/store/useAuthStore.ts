import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null, // Read from localStorage on initial load
  setToken: (token) => {
    localStorage.setItem("token", token); // Save token to localStorage
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem("token"); // Remove token from localStorage
    set({ token: null });
  },
}));
