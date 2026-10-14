import type { ApiErrorBody } from "../types/api";

/** Where the backend lives. Set VITE_API_URL in .env.local (development) or in the hosting dashboard (production). */
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000/api";

const TOKEN_KEY = "retain.token";

// ---------- Token storage ----------
// Storage can be unavailable (private browsing, blocked site data), so every access is guarded.

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Without storage the user simply stays signed in until the page is reloaded.
  }
}

// ---------- Errors ----------

/** Thrown for every failed request, so pages can show `message` and put `fieldErrors` under form fields. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** Called when the server answers 401, meaning the token is missing, expired or invalid. The auth context sets it. */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// ---------- Requests ----------

type QueryValue = string | number | undefined | null;

/** Turns { search: "lunch", page: 2, categoryId: undefined } into "?search=lunch&page=2". Empty values are skipped. */
function toQueryString(query?: object): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query) as [string, QueryValue][]) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: object;
}

/** Sends a request to the API, attaching the saved token, and returns the parsed JSON response. */
async function request<T>(path: string, { method = "GET", body, query }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  // 204 No Content (for example after a delete) has no body to parse.
  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorBody = data as Partial<ApiErrorBody> | null;
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(response.status, errorBody?.message ?? `Request failed (${response.status})`, errorBody?.errors);
  }

  return data as T;
}

/** The API client used by every page. Example: api.get<Category[]>("/categories") */
export const api = {
  get: <T>(path: string, query?: object) => request<T>(path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T = void>(path: string) => request<T>(path, { method: "DELETE" }),
};
