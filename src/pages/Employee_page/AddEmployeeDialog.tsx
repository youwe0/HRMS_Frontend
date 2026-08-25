import { useState, type FormEvent } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered: () => void;
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onRegistered,
}: AddEmployeeDialogProps) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(API_ENDPOINTS.REGISTER, {
        userName,
        password,
      });
      success(`Employee "${userName}" registered successfully.`);
      setUserName("");
      setPassword("");
      onOpenChange(false);
      onRegistered();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message ||
        "Something went wrong. Please try again.";
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Register Employee
          </DialogTitle>
          <DialogDescription>
            Create a new user account for an employee.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-2">
            <label
              htmlFor="dialog-userName"
              className="text-sm font-medium leading-none"
            >
              Username
            </label>
            <Input
              id="dialog-userName"
              type="text"
              placeholder="Enter employee username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="dialog-password"
              className="text-sm font-medium leading-none"
            >
              Password
            </label>
            <Input
              id="dialog-password"
              type="password"
              placeholder="Enter password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !userName || !password}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Registering…
                </>
              ) : (
                "Register Employee"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
