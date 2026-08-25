import { API_BASE_URL } from "../config";

// localStorage key holding the JWT access token.
export const TOKEN_STORAGE_KEY = "hrms_access_token";

export type ApiErrorDetail = { field: string; message: string };

// Envelope returned by the backend for every response.
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiErrorDetail[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors?: ApiErrorDetail[];

  constructor(status: number, message: string, errors?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export const getAuthToken = (): string | null =>
  localStorage.getItem(TOKEN_STORAGE_KEY);

export const setAuthToken = (token: string | null): void => {
  if (token === null) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
};

export type QueryParams = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  headers?: Record<string, string>;
};

const buildUrl = (path: string, query?: QueryParams): string => {
  const base = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  if (!query) return base;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
};

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = "GET", body, query, headers } = options;
  const token = getAuthToken();

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    // Response was not JSON — keep payload null.
  }

  if (!response.ok) {
    // Auto-logout on 401 (expired / invalid token)
    if (response.status === 401 && getAuthToken()) {
      setAuthToken(null);
      window.location.href = "/login?session_expired=1";
    }

    throw new ApiError(
      response.status,
      payload?.message ?? `Request failed with status ${response.status}`,
      payload?.errors,
    );
  }

  return payload?.data as T;
};

// HTTP verbs mapped over the fetch client. 
export const api = {
  get: <T>(path: string, query?: QueryParams) => request<T>(path, { query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export default api;
