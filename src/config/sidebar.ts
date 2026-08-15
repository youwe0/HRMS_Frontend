import {
  Banknote,
  BarChart3,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CalendarOff,
  Clock,
  FileText,
  FolderKanban,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  LifeBuoy,
  Laptop,
  Lock,
  Megaphone,
  Network,
  Receipt,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCircle,
  UserMinus,
  UserPlus,
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
//   by editing this array.

export const sidebarSections: SidebarSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Profile", url: "/my-profile", icon: UserCircle },
      { title: "Announcements", url: "/announcements", icon: Megaphone },
    ],
  },
  {
    label: "Workforce",
    items: [
      { title: "Employees", url: "/employees", icon: Users },
      { title: "Onboarding", url: "/onboarding", icon: UserPlus },
      { title: "Offboarding", url: "/offboarding", icon: UserMinus },
      { title: "Departments", url: "/departments", icon: Building2 },
      { title: "Organization Chart", url: "/org-chart", icon: Network },
    ],
  },
  {
    label: "Time & Leave",
    items: [
      { title: "Attendance", url: "/attendance", icon: CalendarDays },
      { title: "Shift & Roster", url: "/shift-roster", icon: CalendarClock },
      { title: "Leave Management", url: "/leave", icon: CalendarOff },
      { title: "Timesheet", url: "/timesheet", icon: Clock },
    ],
  },
  {
    label: "Payroll & Benefits",
    items: [
      { title: "Payroll", url: "/payroll", icon: Wallet },
      { title: "Benefits", url: "/benefits", icon: Banknote },
      { title: "Expenses & Reimbursement", url: "/expenses", icon: Receipt },
      { title: "Loans & Advances", url: "/loans", icon: HandCoins },
    ],
  },
  {
    label: "Talent",
    items: [
      { title: "Recruitment", url: "/recruitment", icon: Briefcase },
      { title: "Performance Reviews", url: "/performance", icon: Target },
      {
        title: "Training & Development",
        url: "/training",
        icon: GraduationCap,
      },
      { title: "Succession Planning", url: "/succession", icon: TrendingUp },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Assets", url: "/assets", icon: Laptop },
      { title: "Helpdesk", url: "/helpdesk", icon: LifeBuoy },
      { title: "Projects", url: "/projects", icon: FolderKanban },
    ],
  },
  {
    label: "Reports & Compliance",
    items: [
      { title: "Reports & Analytics", url: "/reports", icon: BarChart3 },
      { title: "Documents", url: "/documents", icon: FileText },
      { title: "Compliance", url: "/compliance", icon: ShieldCheck },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Roles & Permissions", url: "/roles-permissions", icon: Lock },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];
