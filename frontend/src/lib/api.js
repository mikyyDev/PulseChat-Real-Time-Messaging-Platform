import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3100/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-logout when JWT expires or becomes invalid
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Dynamically import to avoid circular dependency
      import("../store/useAuthStore.js").then(({ useAuthStore }) => {
        const { authUser } = useAuthStore.getState();
        if (authUser) {
          useAuthStore.setState({ authUser: null, error: null });
        }
      });
    }
    return Promise.reject(err);
  },
);

export default api;
