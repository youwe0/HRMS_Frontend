//   API Endpoints — single source of truth.

//   Organized by backend modules:
//     1. Auth
//     2. Employee
//     3. Department
//     4. Designation
//     5. Leave Type
//     6. User
//     7. User Detail
//     8. Resource Bundle
//     9. Company Master Config
//    10. Attendance
//    11. Permission
//  

export const API_ENDPOINTS = {
  // Auth  
  // Register a new user account
  REGISTER: "/auth/register",
  // Authenticate a user and receive a JWT access token
  LOGIN: "/auth/login",

  // Employee 
  // Retrieve a paginated list of employees (users) from the system
  GET_EMPLOYEES: "/employees",

  // Department 
  // Create a new department
  CREATE_DEPARTMENT: "/departments",
  // Retrieve a paginated list of departments
  GET_DEPARTMENTS: "/departments",
  // Soft-delete a department by setting its IsActive status to 0
  DELETE_DEPARTMENT: (id: number) => `/departments/${id}`,

  // Designation 
  // Create a new designation
  CREATE_DESIGNATION: "/designations",
  // Retrieve a paginated list of designations
  GET_DESIGNATIONS: "/designations",
  // Soft-delete a designation by setting its IsActive status to 0
  DELETE_DESIGNATION: (id: number) => `/designations/${id}`,

  // Leave Type 
  // Create a new leave type
  CREATE_LEAVE_TYPE: "/leave-types",
  // Retrieve a paginated list of leave types
  GET_LEAVE_TYPES: "/leave-types",
  // Soft-delete a leave type by ID
  DELETE_LEAVE_TYPE: (id: number) => `/leave-types/${id}`,

  // User  
  // Generalized entity search for autocomplete (users, departments, designations)
  SEARCH_USERS: "/users/search",

  // User Detail 
  // Retrieve user detail data based on section (e.g. employment-details)
  GET_USER_DETAIL: (section: string) => `/userDetail/${section}`,
  // Upsert (create or update) user detail data for a given section
  UPDATE_USER_DETAIL: (userId: number, section: string) =>
    `/userDetail/${userId}/${section}`,

  // Resource Bundle 
  // Retrieve dropdown/lookup options (blood group, gender, employee type, etc.)
  GET_RESOURCE_BUNDLE: "/resource-bundle",

  // Company Master Config 
  // Upsert a company master config record (e.g. holiday-based-on type)
  UPSERT_COMPANY_MASTER_CONFIG: "/company-master-config",
  // Retrieve all active company master config records
  GET_COMPANY_MASTER_CONFIG: "/company-master-config",

  // Attendance 
  // Record a clock-in or clock-out event for a user
  MAKE_ATTENDANCE: (userId: number) => `/attendance/${userId}`,
  // Retrieve attendance records for a user within a date range
  GET_ATTENDANCE: (userId: number) => `/attendance/${userId}`,

  // Permission 
  // Bulk-sync permissions (inserts new, updates existing by code)
  SYNC_PERMISSIONS: "/permissions",
  // Create a single new permission
  CREATE_PERMISSION: "/permissions/create",
  // Retrieve a paginated list of all permissions
  GET_PERMISSIONS: "/permissions",
  // Update an existing permission by ID
  UPDATE_PERMISSION: (id: number) => `/permissions/${id}`,
  // Delete a permission by ID
  DELETE_PERMISSION: (id: number) => `/permissions/${id}`,
  // Assign permissions to a user (replaces existing permissions)
  ASSIGN_USER_PERMISSIONS: (userId: number | string) =>
    `/users/${userId}/permissions`,
  // Retrieve permissions assigned to a user
  GET_USER_PERMISSIONS: (userId: number | string) =>
    `/users/${userId}/permissions`,
} as const;

export type Endpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
