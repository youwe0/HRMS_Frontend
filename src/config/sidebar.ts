import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type SidebarItem = {
  // Display name of the item.
  title: string;
  // Route the item navigates to.
  url: string;
  //  Lucide icon shown next to the title.
  icon: LucideIcon;
};

export type SidebarSection = {
  // Heading shown above the section's items.
  label: string;
  items: SidebarItem[];
};

//   Sidebar navigation configuration.
//   All sidebar elements live here — add, remove or reorder sections/items
//   by editing this array. The items below are placeholders; replace them
//   with the real HRMS modules.

export const sidebarSections: SidebarSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Employees", url: "/employees", icon: Users },
      { title: "Attendance", url: "/attendance", icon: CalendarDays },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Payroll", url: "/payroll", icon: Wallet },
      { title: "Reports", url: "/reports", icon: FileText },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];
