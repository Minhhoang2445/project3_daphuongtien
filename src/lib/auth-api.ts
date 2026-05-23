import { api } from "@/lib/api-client";
import type {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from "@/types/auth";

export function loginRequest(input: LoginInput): Promise<LoginResponse> {
  return api.post<LoginResponse["data"]>("/viewer/login", input, {
    skipAuth: true,
  });
}

export function registerRequest(
  input: RegisterInput
): Promise<RegisterResponse> {
  return api.post<RegisterResponse["data"]>("/viewer/register", input, {
    skipAuth: true,
  });
}
