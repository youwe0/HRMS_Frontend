//  App-wide configuration loaded from Vite environment variables.

// Base URL of the backend API. Falls back to the Vite dev proxy path.
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "/api";
export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? "HRMS";

// API Configuration
// Central place for API settings. Add new section endpoints here as they
// are developed (contact, education, etc.).

export const API_CONFIG = {
  // Full backend URL for tools like Postman (bypasses Vite proxy).
  BASE_URL: "http://localhost:5000/api",

  // Auth endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },

  // User Detail section endpoints (parameterized under /userDetail/:section)
  USER_DETAIL: {
    // @param section — e.g. "employment-details", "contact-details"
    GET: (section: string) => `/userDetail/${section}`,
    SECTIONS: ["employment-details"] as const,
    // Future sections:
    // "contact-details",
    // "education-details",
  },

  // Other API resources
  EMPLOYEES: "/employees",
  DEPARTMENTS: "/departments",
  DESIGNATIONS: "/designations",
  LEAVE_TYPES: "/leave-types",
  USERS_SEARCH: "/users/search",
  RESOURCE_BUNDLE: "/resource-bundle",
} as const;
