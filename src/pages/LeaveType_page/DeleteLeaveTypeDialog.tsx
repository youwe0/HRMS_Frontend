import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface DeleteLeaveTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveTypeId: number | null;
  leaveTypeName: string;
  onDeleted: () => void;
}

export function DeleteLeaveTypeDialog({
  open,
  onOpenChange,
  leaveTypeId,
  leaveTypeName,
  onDeleted,
}: DeleteLeaveTypeDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();

  const handleDelete = async () => {
    if (leaveTypeId === null) return;
    setLoading(true);

    try {
      await api.delete(API_ENDPOINTS.DELETE_LEAVE_TYPE(leaveTypeId));
      success(`Leave type "${leaveTypeName}" deleted successfully.`);
      onOpenChange(false);
      onDeleted();
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
              <Trash2 className="size-5 text-destructive" />
              Delete Leave Type
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{leaveTypeName}"</strong>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
