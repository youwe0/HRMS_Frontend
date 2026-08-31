import { useState, type FormEvent } from "react";
import { Loader2, Pencil } from "lucide-react";
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
import { UserSearchInput } from "@/components/UserSearchInputByDebouncing/UserSearchInput";

interface EditEmploymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
  onUpdated: () => void;
}

export function EditEmploymentDetailsDialog({
  open,
  onOpenChange,
  userId,
  userName,
  onUpdated,
}: EditEmploymentDetailsDialogProps) {
  const [employeeCode, setEmployeeCode] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [designationId, setDesignationId] = useState<number | null>(null);
  const [designationName, setDesignationName] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(
        API_ENDPOINTS.UPDATE_USER_DETAIL(userId, "employment-details"),
        {
          employeeCode,
          department: departmentName,
          designation: designationName,
          dateOfJoining,
        },
      );
      success(`Employment details updated for "${userName}".`);
      setEmployeeCode("");
      setDepartmentId(null);
      setDepartmentName("");
      setDesignationId(null);
      setDesignationName("");
      setDateOfJoining("");
      onOpenChange(false);
      onUpdated();
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
              <Pencil className="size-5" />
              Edit Employment Details
            </DialogTitle>
            <DialogDescription>
              Update employment details for <strong>{userName}</strong> (ID:{" "}
              {userId}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="dialog-employeeCode"
                className="text-sm font-medium leading-none"
              >
                Employee Code
              </label>
              <Input
                id="dialog-employeeCode"
                type="text"
                placeholder="e.g. EC001"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Department
              </label>
              <UserSearchInput
                value={departmentId}
                onChange={(id, label) => {
                  setDepartmentId(id);
                  setDepartmentName(label ?? "");
                }}
                placeholder="Search department by name…"
                searchFor="department"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Designation
              </label>
              <UserSearchInput
                value={designationId}
                onChange={(id, label) => {
                  setDesignationId(id);
                  setDesignationName(label ?? "");
                }}
                placeholder="Search designation by title…"
                searchFor="designation"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dialog-dateOfJoining"
                className="text-sm font-medium leading-none"
              >
                Date of Joining
              </label>
              <Input
                id="dialog-dateOfJoining"
                type="date"
                value={dateOfJoining}
                onChange={(e) => setDateOfJoining(e.target.value)}
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
              <Button
                type="submit"
                disabled={
                  loading ||
                  !employeeCode ||
                  !departmentId ||
                  !designationId ||
                  !dateOfJoining
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
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
