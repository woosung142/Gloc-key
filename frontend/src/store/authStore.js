import { create } from "zustand";

export const useAuthStore = create((set) => ({
  accessToken: localStorage.getItem("accessToken"),
  isLoggedIn: !!localStorage.getItem("accessToken"),

  login: (token) => {
    localStorage.setItem("accessToken", token);
    set({
      accessToken: token,
      isLoggedIn: true,
    });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({
      accessToken: null,
      isLoggedIn: false,
    });
  },
}));
