# FrontendActions.md

## Departments — Add Department Feature

- **Date/Time:** 2026-08-26
- **Change:** Added the Departments page with "Add Department" dialog. Created `src/pages/Department_page/Departments.tsx` and `src/pages/Department_page/AddDepartmentDialog.tsx`. Added `CREATE_DEPARTMENT` endpoint to `src/config/endpoints.ts`. Added `/departments` route to `App.tsx`.
- **Why:** To allow users to create departments from the frontend. Department name is required, HOD (user ID) is optional.
