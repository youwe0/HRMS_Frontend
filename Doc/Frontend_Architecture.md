# Frontend Architecture

> **Last Updated:** 2026-09-05  
> **Stack:** Vite 8 + React 19 + TypeScript 6 + Tailwind CSS v4 + shadcn/ui + lucide-react  
> **Dev Server:** `localhost:5173` (proxies `/api` → `localhost:5000`)

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Common Support Modules](#2-common-support-modules)
   - [API Client](#21-api-client--apiclientts)
   - [Config](#22-config--configts)
   - [Endpoints](#23-endpoints--configendpointsts)
   - [Sidebar Config](#24-sidebar-config--configsidesbarts)
   - [IndexedDB Cache System](#25-indexeddb-cache-system--libindexedbts)
   - [IndexedDB Config](#26-indexeddb-config--configconfigindexeddbts)
   - [Crypto](#27-crypto--libcryptots)
   - [Utilities](#28-utilities--libutilsts)
   - [Resource Bundle Hook](#29-resource-bundle-hook--hooksuseresourcebundlets)
   - [Connection Lost Overlay](#211-connection-lost-overlay--componentsapputilitycomponentsconnectionlosttsx)
   - [Logout Dialog](#212-logout-dialog--componentsapputilitycomponentslogoutdialogtsx)
   - [User Search Input](#213-user-search-input--componentsusersearchinputbydebouncingusersearchinputtsx)
3. [Layout Components](#3-layout-components)
4. [Page Modules](#4-page-modules)
   - [Login](#41-login-module)
   - [Dashboard](#42-dashboard-module)
   - [Employees](#43-employees-module)
   - [Departments](#44-departments-module)
   - [Designations](#45-designations-module)
   - [Leave Types](#46-leave-types-module)
   - [My Profile](#47-my-profile-module)
   - [Company Master Config](#48-company-master-config-module)
   - [Attendance](#49-attendance-module)
   - [Roles & Permissions](#410-roles--permissions-module)
5. [Routing](#5-routing)
6. [Caching Strategy Summary](#6-caching-strategy-summary)

---

## 1. Project Structure

```
src/
├── App.tsx                          # Root component — renders AppRoutes
├── main.tsx                         # Entry point — BrowserRouter, ThemeProvider, TooltipProvider
├── index.css                        # Global styles + Tailwind CSS v4 imports
├── config.ts                        # App-wide config (API_BASE_URL, APP_NAME)
│
├── api/
│   └── client.ts                    # Fetch-based API client with auth token, ApiResponse envelope
│
├── config/
│   ├── endpoints.ts                 # Centralized API endpoint constants
│   ├── sidebar.ts                   # Sidebar navigation structure (sections + items)
│   └── ConfigIndexedDB.ts           # IndexedDB configuration (DB name, version, TTLs per module)
│
├── hooks/
│   └── useResourceBundle.ts         # Custom hook — fetches & caches the ResourceBundle lookup data
│
├── lib/
│   ├── indexedDb.ts                 # IndexedDB cache abstraction (get/set/clear, module factory)
│   ├── crypto.ts                    # SHA-256 hashing (Web Crypto API) for password pre-hashing
│   └── utils.ts                     # Shared utilities (cn for Tailwind merge, decodeTokenPayload)
│
├── components/
│   ├── theme-provider.tsx           # Theme context (light/dark) with localStorage persistence
│   ├── ui/                          # shadcn/ui generated components (do NOT hand-edit)
│   ├── layout/
│   │   ├── AppSidebar.tsx           # Desktop sidebar — collapsible, hover-expand, logout dialog
│   │   ├── BottomNav.tsx            # Mobile bottom navigation bar + slide-up menu
│   │   ├── Header.tsx               # Page header — title, description, real-time clock, back button
│   │   ├── PageLayout.tsx           # Standard page wrapper (flex column + padding)
│   │   └── ProtectedLayout.tsx      # Auth gate — redirects to /login if no token, wraps with sidebar
│   └── UserSearchInputByDebouncing/
│       └── UserSearchInput.tsx      # Reusable search autocomplete (user/department/designation)
│
└── pages/
    ├── Login_Page/
    │   └── Login.tsx                # Login form with SHA-256 pre-hashing
    ├── Dashboard/
    │   └── Dashboard.tsx            # Dashboard with stats cards (dummy data for now)
    ├── Employee_page/
    │   ├── Employees.tsx            # Employee list with pagination + cache
    │   ├── AddEmployeeDialog.tsx    # Register new employee dialog
    │   └── EditEmploymentDetailsDialog.tsx  # Edit employment details dialog
    ├── Department_page/
    │   ├── Departments.tsx          # Department list + cache
    │   ├── AddDepartmentDialog.tsx  # Create department dialog
    │   ├── EditDepartmentDialog.tsx  # Edit department dialog
    │   └── DeleteDepartmentDialog.tsx # Delete department confirmation dialog
    ├── Designation_page/
    │   ├── Designations.tsx         # Designation list + cache
    │   ├── AddDesignationDialog.tsx # Create designation dialog
    │   └── DeleteDesignationDialog.tsx # Delete designation confirmation dialog
    ├── LeaveType_page/
    │   ├── LeaveTypes.tsx           # Leave type list with infinite scroll + cache
    │   ├── AddLeaveTypeDialog.tsx   # Create leave type dialog
    │   └── DeleteLeaveTypeDialog.tsx # Delete leave type confirmation dialog
    ├── MyProfile_page/
    │   └── MyProfile.tsx            # User profile — fetches employment details from userDetail API
    ├── CompanyMasterConfig_page/
    │   └── CompanyMasterConfig.tsx  # Company config manager — HolidayBasedOnType, etc.
    └── Attendance_page/
        ├── Attendance.tsx           # Attendance page — combines MakeAttendance + ShowAttendance
        ├── MakeAttendance.tsx       # Clock-in / clock-out button component
        └── ShowAttendance.tsx       # Attendance history table with month/year navigation
    └── RolesPermissions_page/
        ├── RolesPermissions.tsx     # Roles & permissions page — lists all permissions
        └── SyncPermissionsDialog.tsx # Sync permissions dialog — pushes definitions to backend
```

---

## 2. Common Support Modules

### 2.1 API Client — `api/client.ts`

**Purpose:** Centralized HTTP client used by every module to call the backend API.

| Export | Type | Description |
|---|---|---|
| `api.get<T>(path, query?)` | function | GET request, returns typed `T` |
| `api.post<T>(path, body?)` | function | POST request |
| `api.put<T>(path, body?)` | function | PUT request |
| `api.patch<T>(path, body?)` | function | PATCH request |
| `api.delete<T>(path)` | function | DELETE request |
| `getAuthToken()` | function | Returns JWT from `localStorage` |
| `setAuthToken(token)` | function | Sets/clears JWT in `localStorage` |
| `TOKEN_STORAGE_KEY` | const | `"hrms_access_token"` |
| `ApiResponse<T>` | type | `{ success, message, data, errors? }` |
| `ApiError` | class | Error with `status`, `message`, `errors` fields |

**Behaviour:**
- Attaches `Authorization: Bearer <token>` header automatically.
- On 401 response: clears token and redirects to `/login?session_expired=1`.
- Non-JSON responses are handled gracefully (payload stays `null`).

---

### 2.2 Config — `config.ts`

**Purpose:** App-wide configuration loaded from Vite environment variables.

| Export | Type | Default | Description |
|---|---|---|---|
| `API_BASE_URL` | string | `"/api"` | Backend API base URL (from `VITE_API_URL`) |
| `APP_NAME` | string | `"HRMS"` | App display name (from `VITE_APP_NAME`) |
| `API_CONFIG` | object | — | Static API config with full `BASE_URL` for tools like Postman |

---

### 2.3 Endpoints — `config/endpoints.ts`

**Purpose:** Single source of truth for all API endpoint paths. Every page imports from here — never hardcode paths.

| Export | Value | Used By |
|---|---|---|
| `REGISTER` | `"/auth/register"` | Login (future) |
| `LOGIN` | `"/auth/login"` | Login |
| `GET_EMPLOYEES` | `"/employees"` | Employees |
| `CREATE_DEPARTMENT` | `"/departments"` | AddDepartmentDialog |
| `GET_DEPARTMENTS` | `"/departments"` | Departments |
| `DELETE_DEPARTMENT(id)` | `` `/departments/${id}` `` | DeleteDepartmentDialog |
| `SEARCH_USERS` | `"/users/search"` | UserSearchInput |
| `CREATE_DESIGNATION` | `"/designations"` | AddDesignationDialog |
| `GET_DESIGNATIONS` | `"/designations"` | Designations |
| `DELETE_DESIGNATION(id)` | `` `/designations/${id}` `` | DeleteDesignationDialog |
| `CREATE_LEAVE_TYPE` | `"/leave-types"` | AddLeaveTypeDialog |
| `GET_LEAVE_TYPES` | `"/leave-types"` | LeaveTypes |
| `DELETE_LEAVE_TYPE(id)` | `` `/leave-types/${id}` `` | DeleteLeaveTypeDialog |
| `GET_RESOURCE_BUNDLE` | `"/resource-bundle"` | useResourceBundle hook |
| `GET_USER_DETAIL(section)` | `` `/userDetail/${section}` `` | MyProfile |
| `UPDATE_USER_DETAIL(userId, section)` | `` `/userDetail/${userId}/${section}` `` | EditEmploymentDetailsDialog |
| `UPSERT_COMPANY_MASTER_CONFIG` | `"/company-master-config"` | CompanyMasterConfig |
| `GET_COMPANY_MASTER_CONFIG` | `"/company-master-config"` | CompanyMasterConfig |
| `MAKE_ATTENDANCE(userId)` | `` `/attendance/${userId}` `` | MakeAttendance |
| `GET_ATTENDANCE(userId)` | `` `/attendance/${userId}` `` | ShowAttendance |
| `SYNC_PERMISSIONS` | `"/permissions"` | SyncPermissionsDialog |
| `GET_PERMISSIONS` | `"/permissions"` | RolesPermissions |

---

### 2.4 Sidebar Config — `config/sidebar.ts`

**Purpose:** Defines the desktop sidebar navigation structure. Sections and items are rendered by `AppSidebar.tsx`.

| Export | Type | Description |
|---|---|---|
| `sidebarSections` | `SidebarSection[]` | Array of sections, each with a `label` and `items[]` |
| `SidebarSection` | type | `{ label: string, items: SidebarItem[] }` |
| `SidebarItem` | type | `{ title: string, url: string, icon: LucideIcon }` |

**Sections:** Overview, Employment_details, Workforce, Time & Leave, Payroll & Benefits, Talent, Operations, Reports & Compliance, Administration.

**Adding a new page:** Add a `SidebarItem` to the appropriate section's `items` array.

---

### 2.5 IndexedDB Cache System — `lib/indexedDb.ts`

**Purpose:** Client-side caching layer using IndexedDB. Stores API responses locally to reduce network requests.

| Export | Type | Description |
|---|---|---|
| `cacheGet<T>(key)` | function | Read cached data by key. Returns `null` on miss or expiry. |
| `cacheSet<T>(key, data, decayMs?)` | function | Write data to cache with TTL. |
| `cacheClear(key)` | function | Delete a single cache entry. |
| `cacheClearAll()` | function | Delete all cache entries. |
| `cacheClearAllExcept(keepKeys)` | function | Delete all entries except those whose keys are in `keepKeys`. Used on logout to preserve the resource bundle. |
| `createModuleCache<T>(moduleName)` | function | Factory — creates typed `get/save/clear` helpers for a module. |
| `ModuleCache<T>` | type | `{ get, save, clear }` — scoped cache interface. |

**How it works:**
1. Each page calls `createModuleCache<Type>("moduleName")` to get a scoped cache.
2. On mount, the page tries `cache.get()` first. If data exists and hasn't expired, it's used immediately (no API call).
3. If cache misses or data is stale, the page fetches from the API and calls `cache.save(data)`.
4. After a create/update/delete operation, the page calls `cache.clear()` then re-fetches.

**Cache key convention:** `"${moduleName}_all"` (e.g., `"departments_all"`).

---

### 2.6 IndexedDB Config — `config/ConfigIndexedDB.ts`

**Purpose:** Configuration for the IndexedDB cache system — database name, version, store name, and per-module TTLs.

| Export | Type | Value | Description |
|---|---|---|---|
| `IDB_DB_NAME` | string | `"hrms-cache-db"` | IndexedDB database name |
| `IDB_DB_VERSION` | number | `4` | Database version (bump on schema changes) |
| `IDB_STORE_NAME` | string | `"DepartmentCacheStore"` | Single key-value object store |
| `CACHE_TTL` | object | — | Per-module TTLs in milliseconds |
| `CacheModule` | type | — | Union of all module keys |

**Per-module TTLs:**

| Module | TTL | Description |
|---|---|---|
| `departments` | 24 hours | Department list |
| `designations` | 24 hours | Designation list |
| `employees` | 12 hours | Employee list |
| `users` | 24 hours | User list |
| `leaveTypes` | 24 hours | Leave type list |
| `resourceBundle` | Never expires | Static lookup data (blood groups, genders, etc.) |
| `employmentDetails` | 12 hours | Employment details |
| `entitySearch` | 12 hours | Generic entity search results |
| `userSearch` | 24 hours | User search autocomplete cache |
| `departmentSearch` | 24 hours | Department search autocomplete cache |
| `designationSearch` | 24 hours | Designation search autocomplete cache |
| `companyMasterConfig` | 24 hours | Company master config |
| `permissions` | 24 hours | Permissions list |

**Adding a new module:**
1. Add a TTL entry to `CACHE_TTL` in `ConfigIndexedDB.ts`.
2. In the page component, call `createModuleCache<Type>("moduleName")`.

---

### 2.7 Crypto — `lib/crypto.ts`

**Purpose:** Client-side SHA-256 hashing using the Web Crypto API. Used to pre-hash passwords before sending to the server (the raw password never travels over the network).

| Export | Type | Description |
|---|---|---|
| `sha256(plaintext)` | function | Returns lowercase hex-encoded SHA-256 digest |

**Used by:** `Login.tsx` — hashes the password before the login API call.

---

### 2.8 Utilities — `lib/utils.ts`

**Purpose:** Shared utility functions used across the app.

| Export | Type | Description |
|---|---|---|
| `cn(...inputs)` | function | Tailwind class merge (clsx + tailwind-merge) |
| `decodeTokenPayload()` | function | Decodes JWT payload from localStorage (no verification) |

**`decodeTokenPayload()` returns:** `{ userId?: number, userName?: string } | null`

**Used by:** `MakeAttendance.tsx`, `ShowAttendance.tsx`, `Header.tsx`

---

### 2.9 Resource Bundle Hook — `hooks/useResourceBundle.ts`

**Purpose:** Custom hook that fetches static lookup data (blood groups, genders, employee types, holiday types) from the API and caches it in IndexedDB.

| Export | Type | Description |
|---|---|---|
| `useResourceBundle()` | hook | Returns `{ data: ResourceBundle \| null, loading: boolean }` |
| `ResourceBundle` | type | `{ Blood_group, Gender, Employee_type, HolidayBasedOnType }` |

**Caching:**
- **Cache key:** `"resourceBundle_all"`
- **TTL:** Never expires (static data)
- **Refetch:** Only on first load or after `cache.clear()` is called

**Used by:** `Login.tsx` (pre-caches resource bundle on mount so it's available for other pages).

---

### 2.10 Loading Screen — `components/AppLoader.tsx`

**Purpose:** Shows a loading screen on page load and fades out once the app is ready.

**Files:**
| File | Purpose |
|---|---|
| `components/AppLoader.tsx` | Loading screen component — Tailwind-styled spinner, HRMS branding |
| `main.tsx` | Renders `<AppLoader />` alongside the app |

**How it works:**
1. `AppLoader` renders a full-screen overlay with `fixed inset-0 z-[9999]` and `bg-background`.
2. Uses Tailwind `transition-opacity duration-300` for smooth fade-out.
3. After 300ms, the component sets `visible = false` and unmounts.
4. Respects dark/light mode via Tailwind's `dark:` variant (inherits from `.dark` class on `<html>`).

**Key behaviour:**
- Respects dark/light mode (uses `bg-background`, `text-primary-foreground`, etc.)
- Smooth 300ms fade-out transition
- Component unmounts after animation (no leftover elements)
- Uses `lucide-react` icons: `Building2` for logo, `Loader2` for spinner

---

### 2.11 Connection Lost Overlay — `components/ApputilityComponents/ConnectionLost.tsx`

**Purpose:** Full-screen overlay that detects browser online/offline status and shows a branded "Connection Lost" page when the user loses internet connectivity.

**Files:**
| File | Purpose |
|---|---|
| `components/ApputilityComponents/ConnectionLost.tsx` | Connection lost overlay — listens to `online`/`offline` events |
| `main.tsx` | Renders `<ConnectionLost />` above the app tree |

**How it works:**
1. `ConnectionLost` reads `navigator.onLine` on mount and listens to `window` `online`/`offline` events.
2. When offline (`isOnline === false`), renders a full-screen overlay with `fixed inset-0 z-[9999]` and `bg-background/95 backdrop-blur-sm`.
3. When back online, returns `null` (no overlay shown).
4. Shows a `WifiOff` icon, "Connection Lost" heading, and a descriptive message.

**Key behaviour:**
- Uses `navigator.onLine` + `online`/`offline` window events for detection
- Renders at `z-[9999]` to sit above all other UI (below `AppLoader` at mount time)
- Respects dark/light mode (uses Tailwind `bg-background`, `text-muted-foreground`, etc.)
- Uses `lucide-react` icons: `WifiOff` for offline indicator, `Building2` for branding
- Auto-hides when connection returns (no manual dismiss needed)

---

### 2.12 Logout Dialog — `components/ApputilityComponents/LogoutDialog.tsx`

**Purpose:** Reusable logout confirmation dialog. Handles cache cleanup, token removal, and navigation internally.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | — | Trigger element (button, menu item, etc.) |

**How it works:**
1. Wraps children in a shadcn `Dialog` — clicking the child opens the confirmation dialog.
2. On confirm: calls `cacheClearAllExcept(["resourceBundle_all"])`, removes token from `localStorage`, navigates to `/login`.
3. On cancel: closes the dialog.

**Used by:** `AppSidebar.tsx` (desktop sidebar), `BottomNav.tsx` (mobile slide-up menu).

---

### 2.13 User Search Input — `components/UserSearchInputByDebouncing/UserSearchInput.tsx`

**Purpose:** Reusable autocomplete search component with debounced API calls and IndexedDB caching. Supports searching users, departments, and designations.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| null` | — | Currently selected entity ID (controlled) |
| `onChange` | `(id, label?) => void` | — | Called when user selects or clears an entity |
| `placeholder` | string | `"Search user by name…"` | Input placeholder |
| `disabled` | boolean | `false` | Disable the input |
| `searchFor` | `"user" \| "department" \| "designation"` | `"user"` | Entity type to search |

**API Endpoint:** `GET /api/users/search?q={term}&searchFor={type}`

**Caching:**
- Uses per-entity-type IndexedDB caches (`userSearch`, `departmentSearch`, `designationSearch`).
- Accumulates results across search terms (deduplicates by `id`).
- Client-side filtering of accumulated results before API calls.
- Debounce delay: 300ms.

**Used by:** `AddEmployeeDialog.tsx`, `EditEmploymentDetailsDialog.tsx`, `AddDepartmentDialog.tsx`

---

## 3. Layout Components

### `ProtectedLayout.tsx`
- **Purpose:** Auth gate — redirects to `/login` if no JWT token exists.
- Wraps children with `SidebarProvider`, `AppSidebar` (desktop), `BottomNav` (mobile).
- **Used by:** All protected routes in `routes/index.tsx`.

### `AppSidebar.tsx`
- **Purpose:** Desktop sidebar — collapsible (icon-only by default, expands on hover).
- Renders navigation from `sidebarSections` config.
- Includes logout dialog and theme toggle (light/dark).
- **Hidden below `md` breakpoint** via Tailwind.

### `BottomNav.tsx`
- **Purpose:** Mobile bottom navigation bar (shown below `md`).
- Shows 3 main items: Home, Attendance, Leave.
- Slide-up menu with additional pages (Employees, Departments, etc.).
- Includes theme toggle (Moon/Sun) and logout button in the slide-up menu.
- Logout clears IndexedDB cache (except resource bundle), removes token, navigates to `/login`.
- `BOTTOM_NAV_ITEMS` — main bar items.
- `MENU_ITEMS` — slide-up menu items (add new pages here).

### `Header.tsx`
- **Purpose:** Page header with title, description, real-time clock, and back button.
- **Props:** `{ title, description?, showBack? }`
- Uses `useRealTimeClock()` — updates every second.

### `PageLayout.tsx`
- **Purpose:** Standard page wrapper — flex column with gap and padding.
- **Props:** `{ children }`

### `theme-provider.tsx`
- **Purpose:** Theme context (light/dark) with `localStorage` persistence.
- **Exports:** `ThemeProvider`, `useTheme()`, `Theme` type.

---

## 4. Page Modules

### 4.1 Login Module

**Path:** `/login`  
**Files:**
| File | Purpose |
|---|---|
| `Login.tsx` | Login form — username + password (with show/hide toggle), SHA-256 pre-hashing, JWT storage |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user, returns JWT token |

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `userName` | string | Username input |
| `password` | string | Password input (hashed with SHA-256 before sending) |
| `passwordHash` | string | SHA-256 hash sent to backend |
| `token` | string | JWT token stored in localStorage |
| `showPassword` | boolean | Toggles password visibility (Eye/EyeOff icon button) |
| `sessionExpired` | boolean | From URL param `?session_expired=1` |

**Caching:** Calls `useResourceBundle()` on mount to pre-cache lookup data.

**Side Effects:**
- On success: stores token in `localStorage`, navigates to `/dashboard`.
- On 401 (expired session): shows orange banner.

---

### 4.2 Dashboard Module

**Path:** `/dashboard`  
**Files:**
| File | Purpose |
|---|---|
| `Dashboard.tsx` | Dashboard with stats cards, attendance, leave balance, holidays, announcements |

**API Endpoints:** None (currently uses dummy data — no API calls).

**Caching:** None.

---

### 4.3 Employees Module

**Path:** `/employees`  
**Files:**
| File | Purpose |
|---|---|
| `Employees.tsx` | Employee list with pagination, add/edit buttons |
| `AddEmployeeDialog.tsx` | Register new employee dialog |
| `EditEmploymentDetailsDialog.tsx` | Edit employment details dialog |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employees?page={n}&limit=10` | Fetch paginated employee list |
| `POST` | `/api/auth/register` | Register new employee (via AddEmployeeDialog) |
| `GET` | `/api/userDetail/employment-details` | Fetch employment details for edit dialog |
| `PUT` | `/api/userDetail/{userId}/employment-details` | Update employment details |

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `employees` | 12 hours | After add/edit employee — `cache.clear()` then re-fetch |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 6 placeholder cards matching the employee card layout (circular avatar, name, ID, role badge, edit button).

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `currentPage` | number | Current pagination page |
| `PAGE_LIMIT` | 10 | Records per page |
| `pagination` | `{ page, limit, total, totalPages }` | Server-side pagination meta |

**Refetch:** On page change, on add employee, on edit employment details.

---

### 4.4 Departments Module

**Path:** `/departments`  
**Files:**
| File | Purpose |
|---|---|
| `Departments.tsx` | Department list table with edit/delete actions |
| `AddDepartmentDialog.tsx` | Create department dialog |
| `EditDepartmentDialog.tsx` | Edit department dialog |
| `DeleteDepartmentDialog.tsx` | Delete department confirmation dialog |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/departments` | Fetch all departments |
| `POST` | `/api/departments` | Create department |
| `DELETE` | `/api/departments/{id}` | Soft-delete department |

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `departments` | 24 hours | After create/edit/delete — `cache.clear()` then `fetchDepartments(true)` |

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `selectedDept` | `Department \| null` | Department selected for edit/delete |
| `dialogOpen` | boolean | Add department dialog state |
| `editDialogOpen` | boolean | Edit department dialog state |
| `deleteDialogOpen` | boolean | Delete department dialog state |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 5 skeleton table rows matching the department table layout (ID, department name, status badge, edit/delete buttons).

**Refetch:** On create, edit, or delete — clears cache and force-refreshes.

---

### 4.5 Designations Module

**Path:** `/designations`  
**Files:**
| File | Purpose |
|---|---|
| `Designations.tsx` | Designation list table with delete action |
| `AddDesignationDialog.tsx` | Create designation dialog |
| `DeleteDesignationDialog.tsx` | Delete designation confirmation dialog |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/designations?page={n}&limit=10` | Fetch paginated designations |
| `POST` | `/api/designations` | Create designation |
| `DELETE` | `/api/designations/{id}` | Soft-delete designation |

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `designations` | 24 hours | After create/delete — cache cleared and re-fetched |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 5 skeleton table rows matching the designation table layout (ID, designation name, status badge, delete button).

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `selectedDesignation` | object \| null | Designation selected for delete |
| `dialogOpen` | boolean | Add designation dialog state |
| `deleteDialogOpen` | boolean | Delete designation dialog state |

---

### 4.6 Leave Types Module

**Path:** `/leave`  
**Files:**
| File | Purpose |
|---|---|
| `LeaveTypes.tsx` | Leave type list with infinite scroll |
| `AddLeaveTypeDialog.tsx` | Create leave type dialog |
| `DeleteLeaveTypeDialog.tsx` | Delete leave type confirmation dialog |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/leave-types?page={n}&limit=10` | Fetch paginated leave types |
| `POST` | `/api/leave-types` | Create leave type |
| `DELETE` | `/api/leave-types/{id}` | Delete leave type |

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `leaveTypes` | 24 hours | After create/delete — cache cleared and re-fetched |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 5 skeleton table rows matching the leave type table layout (leave name, code badge, applicable for, status badge, delete button).

**Pagination:** Uses IntersectionObserver for infinite scroll (not traditional pagination).

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `currentPage` | number | Current page number |
| `hasMore` | boolean | Whether more pages are available |
| `loadingMore` | boolean | Loading state for next page fetch |
| `LIMIT` | 10 | Records per page |

---

### 4.7 My Profile Module

**Path:** `/my-profile`  
**Files:**
| File | Purpose |
|---|---|
| `MyProfile.tsx` | Displays user profile and employment details |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/userDetail/employment-details` | Fetch employment details for current user |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render a 2-column grid of 6 skeleton field placeholders (label + value) matching the profile layout.

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `employmentDetails` | 12 hours | On mount |

---

### 4.8 Company Master Config Module

**Path:** `/company-master-config`  
**Files:**
| File | Purpose |
|---|---|
| `CompanyMasterConfig.tsx` | Company configuration manager (HolidayBasedOnType, etc.) |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/company-master-config` | Fetch all config records |
| `POST` | `/api/company-master-config` | Create or update config record |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 5 skeleton table rows matching the config table layout (ID, module name, based on, created by, created at).

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `companyMasterConfig` | 24 hours | After save — cache cleared and re-fetched |

---

### 4.9 Attendance Module

**Path:** `/attendance`  
**Files:**
| File | Purpose |
|---|---|
| `Attendance.tsx` | Page shell — combines MakeAttendance + ShowAttendance |
| `MakeAttendance.tsx` | Clock-in / clock-out button |
| `ShowAttendance.tsx` | Attendance history table with month/year navigation |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attendance/{userId}` | Clock in or clock out |
| `GET` | `/api/attendance/{userId}?fromDate={date}&toDate={date}` | Fetch attendance for date range |

**Request Body (POST):**
```json
{ "clockTime": "2026-09-02T09:00:00.000Z" }
```

**Response (POST):**
```json
{
  "success": true,
  "message": "Clock-in recorded successfully",
  "data": {
    "attendance": {
      "employeeCode": "EC001",
      "attendanceDate": "2026-09-02T00:00:00.000Z",
      "clockIn": "2026-09-02T09:00:00.000Z",
      "clockOut": null,
      "status": null
    }
  }
}
```

**Response (GET):**
```json
{
  "success": true,
  "message": "Attendance retrieved successfully",
  "data": {
    "attendance": [
      {
        "employeeCode": "EC001",
        "attendanceDate": "2026-09-02T00:00:00.000Z",
        "shift": null,
        "clockIn": "2026-09-02T09:00:00.000Z",
        "clockOut": "2026-09-02T17:30:00.000Z",
        "status": null,
        "isActive": 1,
        "createdAt": "2026-09-02T09:00:00.000Z"
      }
    ]
  }
}
```

**Caching:** None — attendance data is always fetched fresh.

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `selectedMonth` | number | Currently selected month (0–11) |
| `selectedYear` | number | Currently selected year |
| `records` | `AttendanceRecord[]` | Attendance records for the selected month |
| `lastAction` | `"clock_in" \| "clock_out" \| "completed" \| null` | Last action performed |
| `isCurrentMonth` | boolean | Whether the selected month is the current month |

**Button State Machine:**
1. Default → shows "Clock In" (calls POST, gets `clock_in` action)
2. After clock-in → shows "Clock Out" (calls POST, gets `clock_out` action)
3. After clock-out → shows "Completed for Today" (disabled, 409 response)

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 5 skeleton table rows matching the attendance table layout (date, day, clock in, clock out, shift, status badge).

**Refetch:** Attendance history refetches when month/year changes.

---

### 4.10 Roles & Permissions Module

**Path:** `/roles-permissions`  
**Files:**
| File | Purpose |
|---|---|
| `RolesPermissions.tsx` | Roles & permissions page — lists all permissions in a table |
| `SyncPermissionsDialog.tsx` | Sync permissions dialog — pushes all permission definitions to the backend |

**API Endpoints:**
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/permissions` | Fetch all permissions |
| `POST` | `/api/permissions` | Bulk-sync permissions from frontend definitions |

**Loading State:** Uses shadcn/ui `<Skeleton>` component to render 5 skeleton table rows matching the permissions table layout (ID, code, name, type badge, module, parent code, status badge).

**Caching:**
| Cache Module | TTL | Refetch Trigger |
|---|---|---|
| `permissions` | 24 hours | After sync — cache cleared and re-fetched |

**Variables:**
| Variable | Type | Description |
|---|---|---|
| `permissions` | `Permission[]` | List of all permissions |
| `syncDialogOpen` | boolean | Sync dialog open state |

**Permission Definitions:** The `SyncPermissionsDialog` contains a hardcoded array of ~80 permission definitions covering all sidebar modules (dashboard, employees, departments, designations, attendance, leave, etc.) with module, page, section, and button-level permissions.

---

## 5. Routing

**File:** `src/routes/index.tsx`

| Path | Component | Auth Required |
|---|---|---|
| `/login` | `LoginPage` | No |
| `/dashboard` | `DashboardPage` | Yes |
| `/employees` | `EmployeesPage` | Yes |
| `/departments` | `DepartmentsPage` | Yes |
| `/designations` | `DesignationsPage` | Yes |
| `/leave` | `LeaveTypesPage` | Yes |
| `/my-profile` | `MyProfilePage` | Yes |
| `/company-master-config` | `CompanyMasterConfigPage` | Yes |
| `/attendance` | `AttendancePage` | Yes |
| `/roles-permissions` | `RolesPermissionsPage` | Yes |
| `*` | Redirects to `/dashboard` | — |

All protected routes are wrapped with `<ProtectedLayout>` which checks for JWT token.

---

## 6. Caching Strategy Summary

| Module | Cache Key | TTL | Cache Type | Refetch Trigger |
|---|---|---|---|---|
| Departments | `departments_all` | 24h | IndexedDB | Create / Edit / Delete |
| Designations | `designations_all` | 24h | IndexedDB | Create / Delete |
| Employees | `employees_all` | 12h | IndexedDB | Add / Edit |
| Leave Types | `leaveTypes_all` | 24h | IndexedDB (infinite scroll) | Create / Delete |
| Resource Bundle | `resourceBundle_all` | Never | IndexedDB | Never (static data) |
| Employment Details | `employmentDetails_all` | 12h | IndexedDB | On mount |
| Company Master Config | `companyMasterConfig_all` | 24h | IndexedDB | Save |
| User Search | `userSearch_all` | 24h | IndexedDB (accumulated) | Each unique search term |
| Dept Search | `departmentSearch_all` | 24h | IndexedDB (accumulated) | Each unique search term |
| Desig Search | `designationSearch_all` | 24h | IndexedDB (accumulated) | Each unique search term |
| Attendance | — | — | No cache | Always fresh (month/year change) |
| Permissions | `permissions_all` | 24h | IndexedDB | After sync |
| Dashboard | — | — | No cache | N/A (dummy data) |

**Logout behaviour:** On logout, `cacheClearAllExcept(["resourceBundle_all"])` is called — all cached entries are deleted from IndexedDB except the resource bundle (static config data that never changes). This prevents stale user-specific data from leaking into a new session.
