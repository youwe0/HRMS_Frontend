import { Navigate } from "react-router-dom";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAuthToken } from "@/api/client";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  if (!getAuthToken()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main content — add bottom padding on mobile for the bottom nav */}
      <SidebarInset className="pb-16 md:pb-0">{children}</SidebarInset>

      {/* Bottom navigation — mobile only */}
      <BottomNav />
    </SidebarProvider>
  );
}
