import { useState, useEffect, type FormEvent } from "react";
import { Loader2, Plus, Pencil } from "lucide-react";
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
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";

export type PermissionData = {
  id: number;
  code: string;
  name: string;
  type: string;
  module: string;
  parentCode: string | null;
  isActive: number;
};

interface AddPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  editData?: PermissionData | null;
}

export function AddPermissionDialog({
  open,
  onOpenChange,
  onCreated,
  editData,
}: AddPermissionDialogProps) {
  const isEditMode = editData !== null && editData !== undefined;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [module, setModule] = useState("");
  const [parentCode, setParentCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toasts, dismiss, success, error: toastError } = useToast();

  // Pre-fill form when editData changes (dialog opens with data)
  useEffect(() => {
    if (editData) {
      setCode(editData.code);
      setName(editData.name);
      setType(editData.type);
      setModule(editData.module);
      setParentCode(editData.parentCode ?? "");
      setIsActive(editData.isActive === 1);
    } else {
      setCode("");
      setName("");
      setType("");
      setModule("");
      setParentCode("");
      setIsActive(true);
    }
  }, [editData, open]);

  const resetForm = () => {
    setCode("");
    setName("");
    setType("");
    setModule("");
    setParentCode("");
    setIsActive(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode && editData) {
        // Update existing permission
        await api.put(API_ENDPOINTS.UPDATE_PERMISSION(editData.id), {
          code: code.trim(),
          name: name.trim(),
          type,
          module: module.trim(),
          parentCode: parentCode.trim() || null,
          isActive,
        });
        success(`Permission "${code.trim()}" updated successfully.`);
      } else {
        // Create new permission
        await api.post(API_ENDPOINTS.CREATE_PERMISSION, {
          code: code.trim(),
          name: name.trim(),
          type,
          module: module.trim(),
          parentCode: parentCode.trim() || null,
        });
        success(`Permission "${code.trim()}" created successfully.`);
      }
      resetForm();
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

  const isSubmitDisabled =
    loading || !code.trim() || !name.trim() || !type || !module.trim();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditMode ? (
                <>
                  <Pencil className="size-5" />
                  Edit Permission
                </>
              ) : (
                <>
                  <Plus className="size-5" />
                  Add Permission
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the permission details below."
                : "Create a new permission entry in the system."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Code */}
            <div className="space-y-2">
              <label
                htmlFor="perm-code"
                className="text-sm font-medium leading-none"
              >
                Code <span className="text-destructive">*</span>
              </label>
              <Input
                id="perm-code"
                type="text"
                placeholder="e.g. employees.view, departments.button.delete"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier. Use dots as separators (e.g.
                module.type.action).
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="perm-name"
                className="text-sm font-medium leading-none"
              >
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="perm-name"
                type="text"
                placeholder="e.g. View Employees, Delete Department"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Human-readable label shown in the role-editor UI.
              </p>
            </div>

            {/* Type + Module row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Type <span className="text-destructive">*</span>
                </label>
                <Select value={type} onValueChange={setType} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="module">module</SelectItem>
                    <SelectItem value="page">page</SelectItem>
                    <SelectItem value="section">section</SelectItem>
                    <SelectItem value="button">button</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Module */}
              <div className="space-y-2">
                <label
                  htmlFor="perm-module"
                  className="text-sm font-medium leading-none"
                >
                  Module <span className="text-destructive">*</span>
                </label>
                <Input
                  id="perm-module"
                  type="text"
                  placeholder="e.g. employees, departments"
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Parent Code */}
            <div className="space-y-2">
              <label
                htmlFor="perm-parent"
                className="text-sm font-medium leading-none"
              >
                Parent Code
              </label>
              <Input
                id="perm-parent"
                type="text"
                placeholder="e.g. employees.page (optional)"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional. The Code of the parent permission (self-reference).
              </p>
            </div>

            {/* Is Active — only shown in edit mode */}
            {isEditMode && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium leading-none">
                  Active
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  disabled={loading}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    isActive ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      isActive ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs text-muted-foreground">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isEditMode ? "Saving…" : "Creating…"}
                  </>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create Permission"
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
