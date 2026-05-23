import type { ApiResponse } from "@/lib/api-client";

export type AuthUser = {
  id: number;
  username: string;
};

export type LoginInput = {
  username: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  password: string;
};

export type LoginResponse = ApiResponse<{
  viewer: AuthUser;
}>;

export type RegisterResponse = ApiResponse<{
  viewer: AuthUser;
}>;
