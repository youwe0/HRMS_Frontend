//   API Endpoints — single source of truth.
//
//   Import from this file wherever you need to call the API so
//   path strings never get scattered across components.

export const API_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
} as const;

export type Endpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
