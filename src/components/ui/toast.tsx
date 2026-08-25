import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: () => void;
}

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; bar: string }
> = {
  success: {
    container:
      "border-green-500/40 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border-green-500/30",
    icon: "text-green-600 dark:text-green-400",
    bar: "bg-green-500",
  },
  error: {
    container:
      "border-destructive/40 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 dark:border-destructive/30",
    icon: "text-red-600 dark:text-red-400",
    bar: "bg-destructive",
  },
  info: {
    container:
      "border-blue-500/40 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-500/30",
    icon: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
  },
};

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 shrink-0" />,
  error: <XCircle className="size-4 shrink-0" />,
  info: <Info className="size-4 shrink-0" />,
};

export function Toast({
  message,
  variant = "info",
  duration = 4000,
  onDismiss,
}: ToastProps) {
  const [visible, setVisible] = useState(false);

  // mount animation
  useEffect(() => {
    // small delay so CSS transition kicks in
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleAnimationEnd = () => {
    if (visible) {
      onDismiss();
    }
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "pointer-events-auto fixed top-4 left-1/2 z-100 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 sm:top-5",
        "overflow-hidden rounded-lg border shadow-lg",
        "transition-all duration-300 ease-in-out",
        styles.container,
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
      )}
    >
      {/* Content row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className={styles.icon}>{icons[variant]}</span>
        <p className="flex-1 text-sm font-medium leading-tight">{message}</p>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Animated progress bar */}
      <div className="h-1 w-full bg-transparent">
        <div
          className={cn("h-full rounded-full", styles.bar)}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
          onAnimationEnd={handleAnimationEnd}
        />
      </div>

      {/* Keyframes injected via a <style> tag */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Container to render multiple toasts ---------- */

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <>
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          variant={t.variant}
          duration={t.duration}
          onDismiss={() => onDismiss(t.id)}
        />
      ))}
    </>
  );
}

/* ---------- Hook to manage toasts ---------- */

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    message: string,
    variant: ToastVariant = "info",
    duration = 4000,
  ) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (msg: string) => addToast(msg, "success");
  const error = (msg: string) => addToast(msg, "error", 6000);
  const info = (msg: string) => addToast(msg, "info");

  return { toasts, dismiss, success, error, info };
}
