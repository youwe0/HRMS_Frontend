import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";

import LoginPage from "@/pages/Login_Page/Login";
import DashboardPage from "@/pages/Dashboard/Dashboard";
import EmployeesPage from "@/pages/Employee_page/Employees";
import DepartmentsPage from "@/pages/Department_page/Departments";
import DesignationsPage from "@/pages/Designation_page/Designations";
import LeaveTypesPage from "@/pages/LeaveType_page/LeaveTypes";
import MyProfilePage from "@/pages/MyProfile_page/MyProfile";
import CompanyMasterConfigPage from "@/pages/CompanyMasterConfig_page/CompanyMasterConfig";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedLayout>
            <EmployeesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedLayout>
            <DepartmentsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/designations"
        element={
          <ProtectedLayout>
            <DesignationsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/leave"
        element={
          <ProtectedLayout>
            <LeaveTypesPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/my-profile"
        element={
          <ProtectedLayout>
            <MyProfilePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/company-master-config"
        element={
          <ProtectedLayout>
            <CompanyMasterConfigPage />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
