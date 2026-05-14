import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const API_KEY = import.meta.env.VITE_API_KEY || "your_api_key_here";
const COOKIE_NAME = "access_token";

export function getAuthCookie(): string | undefined {
  return Cookies.get(COOKIE_NAME);
}

export function setAuthCookie(token: string, expUnix: number): void {
  Cookies.set(COOKIE_NAME, token, {
    path: "/",
    expires: new Date(expUnix * 1000),
    sameSite: "Lax",
  });
}

export function removeAuthCookie(): void {
  Cookies.remove(COOKIE_NAME, { path: "/" });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Api-Key": API_KEY,
  },
});

// Attach auth token from cookie to every request
api.interceptors.request.use((config) => {
  const token = getAuthCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — but not on auth endpoints (login/register return 401 for bad creds)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");
    const isVerifyEndpoint = url.includes("/resend-verification");
    if (error.response?.status === 401 && !isAuthEndpoint && !isVerifyEndpoint) {
      removeAuthCookie();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
