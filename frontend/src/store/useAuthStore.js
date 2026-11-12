import { create } from "zustand";
import api from "../lib/api.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  error: null,

  // Check if user is already authenticated on app boot / refresh
  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const res = await api.get("/auth/check");
      set({ authUser: res.data });
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Register a new user
  signup: async (data) => {
    set({ isSigningUp: true, error: null });
    try {
      const res = await api.post("/auth/register", data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
      return { success: true, data: res.data };
    } catch (err) {
      const message = !err.response
        ? "Cannot connect to the server. Check that the backend is running."
        : err.response.data?.message ||
          err.response.data?.errors?.[0]?.msg ||
          "Failed to sign up. Please try again.";
      set({ error: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Log in existing user
  login: async (credentials) => {
    set({ isLoggingIn: true, error: null });
    try {
      const res = await api.post("/auth/login", credentials);
      set({ authUser: res.data });
      toast.success("Logged in successfully!");
      return { success: true, data: res.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid credentials or server error.";
      set({ error: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // Log out user
  logout: async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully!");
    } catch (err) {
      console.warn("Logout request failed on server:", err);
      toast.error("Error logging out from server");
    } finally {
      // Always reset local state to ensure the user is logged out in the UI
      set({ authUser: null, error: null });
    }
  },

  // Update profile picture
  updateProfilePic: async (formData) => {
    set({ isUpdatingProfile: true, error: null });
    try {
      const res = await api.put("/auth/profile-pic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set((state) => ({
        authUser: state.authUser
          ? { ...state.authUser, ...res.data }
          : res.data,
      }));
      toast.success("Profile picture updated successfully!");
      return { success: true, data: res.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update profile picture.";
      set({ error: message });
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Helper to clear errors manually
  clearError: () => set({ error: null }),
}));
