import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "@/pages/Login";
import EmployeesPage from "@/pages/Employees";
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

function DashboardPage() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            HRMS Dashboard
          </h1>
          <p>You are logged in.</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
