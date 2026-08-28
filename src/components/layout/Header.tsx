import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

/** Decode the JWT payload (no verification — that happens server-side). */
function decodeTokenPayload(): { userName?: string } | null {
  try {
    const token = localStorage.getItem("hrms_access_token");
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as { userName?: string };
  } catch {
    return null;
  }
}

interface HeaderProps {
  title: string;
  description?: string;
  showBack?: boolean;
}

function useRealTimeClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export function Header({ title, description, showBack = true }: HeaderProps) {
  const navigate = useNavigate();
  const now = useRealTimeClock();

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateString = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userPayload = decodeTokenPayload();
  const userName = userPayload?.userName ?? "";
  const initials = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile header — visible below md breakpoint */}
      <div className="flex max-h-[10vh] -mx-2 items-center justify-between border-b border-border px-4 py-2 md:mx-0 md:hidden">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="size-4" />
        </div>
        <h1 className="truncate text-base font-semibold tracking-tight">
          {title}
        </h1>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
          {initials}
        </div>
      </div>

      {/* Desktop header — hidden below md */}
      <div className="hidden md:flex items-start justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium tabular-nums">{timeString}</p>
            <p className="text-xs">{dateString}</p>
          </div>
        </div>
      </div>
    </>
  );
}
