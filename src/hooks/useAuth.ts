import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../constants/api.constants";
import type { User } from "../types/auth.types";

// User ko localStorage se padhta hai — Login.tsx already save karta hai isi key ke saath
export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN));
};

// Naam se initials nikalne ke liye — "Adrian James" -> "AJ", "Donna" -> "D"
export const getInitials = (name?: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("");
};

export const useAuth = () => {
  const navigate = useNavigate();
  const user = useMemo(() => getStoredUser(), []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    navigate("/login", { replace: true });
  }, [navigate]);

  return { user, isAuthenticated, logout };
};
