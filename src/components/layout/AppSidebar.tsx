import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { Building2, LogOut, Moon, Sun } from "lucide-react";

import { APP_NAME } from "@/config";
import { sidebarSections } from "@/config/sidebar";
import { LogoutDialog } from "@/components/ApputilityComponents/LogoutDialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/ApputilityComponents/theme-provider";

// Application sidebar.
// Collapsed by default (icons only). Hovering over it expands it to show
// the icon and label of each section; moving the mouse away collapses it
// again.

// Returns true when the sidebar's content is taller than its container,
// i.e. the user can scroll to reveal more items.
function useContentOverflow(ref: RefObject<HTMLElement | null>) {
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    // Content height changes don't resize the scroll container itself, so
    // watch its first child as well.
    const content = el.firstElementChild;
    if (content) observer.observe(content);

    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return overflows;
}

export function AppSidebar() {
  const { setOpen } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const contentRef = useRef<HTMLDivElement>(null);
  const contentOverflows = useContentOverflow(contentRef);

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <SidebarContent ref={contentRef}>
          {sidebarSections.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        {/* Soft fade at the bottom of the scrollable area, hinting that
            more items are available. Only rendered while content overflows. */}
        {contentOverflows && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-linear-to-t from-sidebar to-transparent group-data-[collapsible=icon]:hidden"
          />
        )}
      </div>

      {/* w-auto! beats the Separator primitive's data-horizontal:w-full so the
          line fits inside the sidebar instead of overflowing its right edge. */}
      <SidebarSeparator className="w-auto! group-data-[collapsible=icon]:hidden" />

      <SidebarFooter className="gap-1">
        <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:group-data-[collapsible=icon]:flex-col">
          <LogoutDialog>
            <SidebarMenuButton
              tooltip="Logout"
              className="w-auto! flex-1 group-data-[collapsible=icon]:flex-none"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </LogoutDialog>

          <SidebarMenuButton
            tooltip={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label="Toggle theme"
            className="w-auto! shrink-0"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
            <span className="sr-only">Toggle theme</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
