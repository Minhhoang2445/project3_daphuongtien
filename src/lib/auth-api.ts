import { api } from "@/lib/api-client";
import type {
  LoginInput,
  LoginResponse,
  MeResponse,
  RegisterInput,
  RegisterResponse,
} from "@/types/auth";

export function loginRequest(input: LoginInput) {
  return api.post<LoginResponse>("/auth/login", input, { skipAuth: true });
}

export function registerRequest(input: RegisterInput) {
  return api.post<RegisterResponse>("/auth/register", input, {
    skipAuth: true,
  });
}

export function getCurrentUserRequest() {
  return api.get<MeResponse>("/auth/me");
}
