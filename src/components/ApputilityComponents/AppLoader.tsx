import { useEffect, useState } from "react";
import { Building2, Loader2 } from "lucide-react";

export function AppLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Small delay so the loader is visible even if React mounts instantly
    const timer = setTimeout(() => setVisible(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-6 bg-background transition-opacity duration-300 animate-in fade-in">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Building2 className="size-6" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">HRMS</h1>
      <p className="text-sm text-muted-foreground">Loading…</p>
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}
