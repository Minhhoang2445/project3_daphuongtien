const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: string;
  };
};

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  json?: unknown;
  token?: string | null;
  skipAuth?: boolean;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: string;

  constructor(message: string, status: number, code?: string, details?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("accessToken");
}

export function setAccessToken(token: string) {
  window.localStorage.setItem("accessToken", token);
}

export function clearAccessToken() {
  window.localStorage.removeItem("accessToken");
}

function buildUrl(path: string) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();

  if (!text) {
    return {
      success: response.ok,
      message: response.ok ? "OK" : "Empty response",
    };
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      message: text,
    };
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { json, token, skipAuth, headers, ...requestOptions } = options;
  const accessToken = skipAuth ? null : token ?? getAccessToken();
  const requestHeaders = new Headers(headers);

  if (json !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...requestOptions,
      headers: requestHeaders,
      body: json !== undefined ? JSON.stringify(json) : options.body,
    });
  } catch {
    throw new ApiClientError(
      `Không kết nối được API tại ${API_BASE_URL}`,
      0,
      "NETWORK_ERROR"
    );
  }

  const body = await parseJson<T>(response);

  if (!response.ok || !body.success) {
    throw new ApiClientError(
      body.message || "API request failed",
      response.status,
      body.error?.code,
      body.error?.details
    );
  }

  return body.data as T;
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "POST", json }),
  put: <T>(path: string, json?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "PUT", json }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiRequest<T>(path, { ...options, method: "DELETE" }),
};
