//   API Endpoints — single source of truth.
//
//   Import from this file wherever you need to call the API so
//   path strings never get scattered across components.

export const API_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  GET_EMPLOYEES: "/employees",
  CREATE_DEPARTMENT: "/departments",
  GET_DEPARTMENTS: "/departments",
  DELETE_DEPARTMENT: (id: number) => `/departments/${id}`,
  SEARCH_USERS: "/users/search",
  CREATE_DESIGNATION: "/designations",
  GET_DESIGNATIONS: "/designations",
  DELETE_DESIGNATION: (id: number) => `/designations/${id}`,
} as const;

export type Endpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
