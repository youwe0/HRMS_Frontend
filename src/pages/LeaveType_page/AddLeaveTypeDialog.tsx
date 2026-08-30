import { useState, type FormEvent } from "react";
import { Loader2, CalendarOff } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { useResourceBundle } from "@/hooks/useResourceBundle";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";

interface AddLeaveTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddLeaveTypeDialog({
  open,
  onOpenChange,
  onCreated,
}: AddLeaveTypeDialogProps) {
  const [leaveName, setLeaveName] = useState("");
  const [leaveCode, setLeaveCode] = useState("");
  const [applicableFor, setApplicableFor] = useState("");
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();
  const { data: resourceBundle } = useResourceBundle();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(API_ENDPOINTS.CREATE_LEAVE_TYPE, {
        leaveName: leaveName.trim(),
        leaveCode: leaveCode.trim(),
        applicableFor: applicableFor.trim() || undefined,
      });
      success(`Leave type "${leaveName.trim()}" created successfully.`);
      setLeaveName("");
      setLeaveCode("");
      setApplicableFor("");
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
              <CalendarOff className="size-5" />
              Add Leave Type
            </DialogTitle>
            <DialogDescription>
              Create a new leave type in the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="dialog-leaveName"
                className="text-sm font-medium leading-none"
              >
                Leave Name *
              </label>
              <Input
                id="dialog-leaveName"
                type="text"
                placeholder="e.g. Annual Leave"
                value={leaveName}
                onChange={(e) => setLeaveName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dialog-leaveCode"
                className="text-sm font-medium leading-none"
              >
                Leave Code *
              </label>
              <Input
                id="dialog-leaveCode"
                type="text"
                placeholder="e.g. AL"
                value={leaveCode}
                onChange={(e) => setLeaveCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dialog-applicableFor"
                className="text-sm font-medium leading-none"
              >
                Applicable For
              </label>
              <Select
                value={applicableFor}
                onValueChange={setApplicableFor}
                disabled={loading}
              >
                <SelectTrigger id="dialog-applicableFor">
                  <SelectValue placeholder="Select employee type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {(resourceBundle?.Employee_type ?? []).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Button
                type="submit"
                disabled={loading || !leaveName.trim() || !leaveCode.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Leave Type"
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
