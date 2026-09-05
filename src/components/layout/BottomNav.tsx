import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  Briefcase,
  CalendarDays,
  CalendarOff,
  Home,
  Lock,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserCircle,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ApputilityComponents/theme-provider";
import { LogoutDialog } from "@/components/ApputilityComponents/LogoutDialog";

const BOTTOM_NAV_ITEMS = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Attendance", url: "/attendance", icon: CalendarDays },
  { title: "Leave", url: "/leave", icon: CalendarOff },
] as const;

const MENU_ITEMS = [
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Departments", url: "/departments", icon: Building2 },
  { title: "Designations", url: "/designations", icon: Briefcase },
  { title: "Leave Types", url: "/leave", icon: CalendarOff },
  { title: "My Profile", url: "/my-profile", icon: UserCircle },
  { title: "Company Master Config", url: "/company-master-config", icon: Settings },
  { title: "Roles & Permissions", url: "/roles-permissions", icon: Lock },
] as const;

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Slide-up menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-up menu */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-xl bg-background border-t border-border shadow-lg transition-transform duration-200 md:hidden",
          menuOpen ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">
          {MENU_ITEMS.map((item) => {
            const active = location.pathname === item.url;
            return (
              <button
                key={item.url}
                onClick={() => {
                  navigate(item.url);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.title}
              </button>
            );
          })}

          {/* Separator */}
          <div className="my-2 border-t border-border" />

          {/* Action buttons row */}
          <div className="flex items-center gap-5">
            {/* Logout with confirmation dialog */}
            <LogoutDialog>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="size-5" />
                Logout
              </button>
            </LogoutDialog>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background px-2 py-2 md:hidden">
        {/* Menu button — left */}
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className={cn(
            "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-xs font-medium transition-colors",
            menuOpen
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Menu className="size-5" />
          <span>Menu</span>
        </button>

        {/* Main nav items — center */}
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = location.pathname === item.url;
          return (
            <button
              key={item.url}
              onClick={() => navigate(item.url)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-xs font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="size-5" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
