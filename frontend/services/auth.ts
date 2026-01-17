// src/services/auth.ts
import api from "./client";

export const authService = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    const user = { name: username };

    const response = await api.post("/login", formData);
    const token = response.headers['access']; 
    if (token) {
      localStorage.setItem("visionary_token", token);
      localStorage.setItem("visionary_user", JSON.stringify(user));
    }
    return { token, user: { name: username } };
  },

  signup: async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    // 백엔드의 /signup 엔드포인트 호출
    return await api.post("/signup", formData);
  },

  logout: async () => {
    try {
      await api.delete("/logout");
    } finally {
      localStorage.removeItem("visionary_token");
      localStorage.removeItem("visionary_user");
      window.location.href = "/login";
    }
  }
};