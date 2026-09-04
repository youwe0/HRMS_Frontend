import { useState, type FormEvent } from "react";
import { Loader2, Building2 } from "lucide-react";
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
import { UserSearchInput } from "@/components/ApputilityComponents/SearchOnDebounce";

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddDepartmentDialog({
  open,
  onOpenChange,
  onCreated,
}: AddDepartmentDialogProps) {
  const [department, setDepartment] = useState("");
  const [hodUserId, setHodUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: { department: string; hod?: number } = {
        department: department.trim(),
      };
      if (hodUserId !== null) {
        payload.hod = hodUserId;
      }

      await api.post(API_ENDPOINTS.CREATE_DEPARTMENT, payload);
      success(`Department "${department.trim()}" created successfully.`);
      setDepartment("");
      setHodUserId(null);
      onOpenChange(false);
      onCreated();
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
              <Building2 className="size-5" />
              Add Department
            </DialogTitle>
            <DialogDescription>
              Create a new department in the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="dialog-department"
                className="text-sm font-medium leading-none"
              >
                Department Name
              </label>
              <Input
                id="dialog-department"
                type="text"
                placeholder="Enter department name"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dialog-hod"
                className="text-sm font-medium leading-none"
              >
                HOD User ID{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <UserSearchInput
                value={hodUserId}
                onChange={(userId) => setHodUserId(userId)}
                placeholder="Search HOD by name…"
                searchFor="user"
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
              <Button type="submit" disabled={loading || !department.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Department"
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
