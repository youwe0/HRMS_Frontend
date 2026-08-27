import { useState, type FormEvent } from "react";
import { Loader2, Briefcase } from "lucide-react";
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

interface AddDesignationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddDesignationDialog({
  open,
  onOpenChange,
  onCreated,
}: AddDesignationDialogProps) {
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(API_ENDPOINTS.CREATE_DESIGNATION, {
        designation: designation.trim(),
      });
      success(`Designation "${designation.trim()}" created successfully.`);
      setDesignation("");
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
              <Briefcase className="size-5" />
              Add Designation
            </DialogTitle>
            <DialogDescription>
              Create a new designation in the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="dialog-designation"
                className="text-sm font-medium leading-none"
              >
                Designation Name
              </label>
              <Input
                id="dialog-designation"
                type="text"
                placeholder="Enter designation name"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
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
              <Button type="submit" disabled={loading || !designation.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Designation"
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
