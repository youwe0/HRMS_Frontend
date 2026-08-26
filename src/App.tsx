import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "@/pages/Login_Page/Login";
import DashboardPage from "@/pages/Dashboard/Dashboard";
import EmployeesPage from "@/pages/Employee_page/Employees";
import DepartmentsPage from "@/pages/Department_page/Departments";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { getAuthToken } from "@/api/client";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset>
                <DashboardPage />
              </SidebarInset>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset>
                <EmployeesPage />
              </SidebarInset>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <SidebarProvider defaultOpen={false}>
              <AppSidebar />
              <SidebarInset>
                <DepartmentsPage />
              </SidebarInset>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
