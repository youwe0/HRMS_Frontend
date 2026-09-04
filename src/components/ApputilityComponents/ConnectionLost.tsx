import { useEffect, useState } from "react";
import { Building2, WifiOff } from "lucide-react";

export function ConnectionLost() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm">
      <div className="flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <WifiOff className="size-7" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Connection Lost
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          You&apos;re currently offline. Please check your internet connection
          and try again.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="size-3.5" />
        <span>HRMS</span>
      </div>
    </div>
  );
}
