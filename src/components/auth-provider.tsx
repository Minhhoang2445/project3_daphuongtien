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

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/api-client";
import {
  getCurrentUserRequest,
  loginRequest,
  registerRequest,
} from "@/lib/auth-api";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearAccessToken();
    setUser(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();

    if (!token) {
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    try {
      setStatus("loading");
      const data = await getCurrentUserRequest();
      setUser(data.user);
      setStatus("authenticated");
      setError(null);
    } catch (requestError) {
      clearAccessToken();
      setUser(null);
      setStatus("unauthenticated");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Khong the lay thong tin tai khoan"
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      const token = getAccessToken();

      if (!token) {
        await Promise.resolve();

        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }

        return;
      }

      try {
        const data = await getCurrentUserRequest();

        if (!cancelled) {
          setUser(data.user);
          setStatus("authenticated");
          setError(null);
        }
      } catch (requestError) {
        clearAccessToken();

        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Khong the lay thong tin tai khoan"
          );
        }
      }
    }

    void hydrateUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const data = await loginRequest(input);
    setAccessToken(data.accessToken);
    setUser(data.user);
    setStatus("authenticated");
    setError(null);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await registerRequest(input);

    if (data.accessToken) {
      setAccessToken(data.accessToken);
      setUser(data.user);
      setStatus("authenticated");
    }

    setError(null);
    return data;
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
