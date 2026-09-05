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
  CREATE_LEAVE_TYPE: "/leave-types",
  GET_LEAVE_TYPES: "/leave-types",
  DELETE_LEAVE_TYPE: (id: number) => `/leave-types/${id}`,
  GET_RESOURCE_BUNDLE: "/resource-bundle",
  GET_USER_DETAIL: (section: string) => `/userDetail/${section}`,
  UPDATE_USER_DETAIL: (userId: number, section: string) =>
    `/userDetail/${userId}/${section}`,
  UPSERT_COMPANY_MASTER_CONFIG: "/company-master-config",
  GET_COMPANY_MASTER_CONFIG: "/company-master-config",
  MAKE_ATTENDANCE: (userId: number) => `/attendance/${userId}`,
  GET_ATTENDANCE: (userId: number) => `/attendance/${userId}`,
  SYNC_PERMISSIONS: "/permissions",
  CREATE_PERMISSION: "/permissions/create",
  GET_PERMISSIONS: "/permissions",
  UPDATE_PERMISSION: (id: number) => `/permissions/${id}`,
  DELETE_PERMISSION: (id: number) => `/permissions/${id}`,
  ASSIGN_USER_PERMISSIONS: (userId: number | string) => `/users/${userId}/permissions`,
  GET_USER_PERMISSIONS: (userId: number | string) => `/users/${userId}/permissions`,
} as const;

export type Endpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
