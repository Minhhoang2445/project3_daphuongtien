export type UserRole = "VIEWER" | "STREAMER" | "ADMIN";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  role: UserRole;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterResponse = {
  user: AuthUser;
  accessToken?: string;
};

export type MeResponse = {
  user: AuthUser;
};
