import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Decode the JWT payload (no verification — that happens server-side).
export function decodeTokenPayload(): {
  userId?: number;
  userName?: string;
} | null {
  try {
    const token = localStorage.getItem("hrms_access_token");
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
