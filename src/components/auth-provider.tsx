"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginRequest, registerRequest } from "@/lib/auth-api";
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  RegisterResponse,
} from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getCurrentViewer(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const viewerId = window.localStorage.getItem("viewerId");
  const username = window.localStorage.getItem("username");

  if (!viewerId || !username) return null;

  return {
    id: Number(viewerId),
    username,
  };
}

function setCurrentViewer(viewer: AuthUser) {
  window.localStorage.setItem("viewerId", String(viewer.id));
  window.localStorage.setItem("username", viewer.username);
}

function clearCurrentViewer() {
  window.localStorage.removeItem("viewerId");
  window.localStorage.removeItem("username");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearCurrentViewer();
    setUser(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const viewer = getCurrentViewer();
    setUser(viewer);
    setStatus(viewer ? "authenticated" : "unauthenticated");
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      const viewer = getCurrentViewer();

      await Promise.resolve();

      if (!cancelled) {
        setUser(viewer);
        setStatus(viewer ? "authenticated" : "unauthenticated");
        setError(null);
      }
    }

    void hydrateUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    const viewer = response.data.viewer;

    setCurrentViewer(viewer);
    setUser(viewer);
    setStatus("authenticated");
    setError(null);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await registerRequest(input);
    setError(null);
    return response;
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      error,
      login,
      register,
      logout,
      refreshUser,
    }),
    [error, login, logout, refreshUser, register, status, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
