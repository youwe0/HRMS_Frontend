import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { UserSearchInput } from "@/components/ApputilityComponents/SearchOnDebounce";
import { createModuleCache } from "@/lib/indexedDb";
import { Skeleton } from "@/components/ui/skeleton";

type Permission = {
  id: number;
  code: string;
  name: string;
  type: string;
  module: string;
  parentCode: string | null;
  isActive: number;
};

type PermissionsResponse = {
  permissions: Permission[];
};

type UserPermissionsResponse = {
  user: {
    userId: string;
    userName: string;
    permissions: number[];
  };
};

type AssignPermissionsResponse = {
  user: {
    userId: string;
    userName: string;
    permissions: number[];
  };
};

interface GivePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
}

const permissionsCache = createModuleCache<Permission[]>("permissions");

const TYPE_BADGE_COLORS: Record<string, string> = {
  module:
    "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  page:
    "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  section:
    "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  button:
    "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
};

export function GivePermissionDialog({
  open,
  onOpenChange,
  onAssigned,
}: GivePermissionDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all permissions
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadPermissions() {
      setLoading(true);
      setError("");

      try {
        // Try cache first
        const cached = await permissionsCache.get();
        if (cached && cached.length > 0 && !cancelled) {
          setPermissions(cached.filter((p) => p.isActive));
          setLoading(false);
          return;
        }

        const data = await api.get<PermissionsResponse>(
          API_ENDPOINTS.GET_PERMISSIONS,
        );
        if (!cancelled) {
          const activePermissions = data.permissions.filter((p) => p.isActive);
          setPermissions(activePermissions);
          await permissionsCache.save(data.permissions);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { message?: string }).message ||
            "Failed to load permissions.";
          setError(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPermissions();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Fetch user's existing permissions when user is selected
  useEffect(() => {
    if (!selectedUserId || !open) return;

    let cancelled = false;

    async function loadUserPermissions() {
      try {
        const data = await api.get<UserPermissionsResponse>(
          API_ENDPOINTS.GET_USER_PERMISSIONS(String(selectedUserId)),
        );
        if (!cancelled && data.user) {
          setSelectedPermissions(data.user.permissions || []);
        }
      } catch {
        // User might not have any permissions yet, that's okay
        if (!cancelled) {
          setSelectedPermissions([]);
        }
      }
    }

    loadUserPermissions();
    return () => {
      cancelled = true;
    };
  }, [selectedUserId, open]);

  // Reset state when dialog closes
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      setSelectedUserId(null);
      setSelectedUserName("");
      setSelectedPermissions([]);
      setError("");
      setSuccess("");
    }
    prevOpen.current = open;
  });

  const handleUserSelect = (id: number | null, label?: string) => {
    setSelectedUserId(id);
    setSelectedUserName(label || "");
    setSelectedPermissions([]);
    setError("");
    setSuccess("");
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSelectAll = () => {
    if (selectedPermissions.length === permissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(permissions.map((p) => p.id));
    }
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      setError("Please select a user first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.put<AssignPermissionsResponse>(
        API_ENDPOINTS.ASSIGN_USER_PERMISSIONS(String(selectedUserId)),
        { permissions: selectedPermissions },
      );
      setSuccess(
        `Permissions assigned successfully to ${selectedUserName}.`,
      );
      onAssigned?.();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message ||
        "Failed to assign permissions.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const isAllSelected =
    permissions.length > 0 && selectedPermissions.length === permissions.length;
  const isIndeterminate =
    selectedPermissions.length > 0 && selectedPermissions.length < permissions.length;

  // Group permissions by module
  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Give Permission
          </DialogTitle>
          <DialogDescription>
            Assign permissions to a user. Select a user and check the
            permissions you want to assign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Search */}
          <div className="space-y-2">
            <Label htmlFor="user-search">Select User</Label>
            <UserSearchInput
              value={selectedUserId}
              onChange={handleUserSelect}
              placeholder="Search user by name..."
              searchFor="user"
            />
            {selectedUserName && (
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium">{selectedUserName}</span>
              </p>
            )}
          </div>

          {/* Permissions List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Permissions</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedPermissions.length} / {permissions.length} selected
                </Badge>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="size-4" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : error && permissions.length === 0 ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : permissions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No permissions found. Create permissions first.
              </p>
            ) : (
              <div className="h-87.5 overflow-y-auto rounded-md border p-4">
                {/* Select All */}
                <div className="mb-3 flex items-center gap-2 border-b pb-2">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    ref={(ref) => {
                      if (ref) {
                        (ref as HTMLInputElement).indeterminate = isIndeterminate;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label
                    htmlFor="select-all"
                    className="cursor-pointer font-medium"
                  >
                    Select All
                  </Label>
                </div>

                {/* Grouped Permissions */}
                {Object.entries(groupedPermissions).map(
                  ([module, modulePermissions]) => (
                    <div key={module} className="mb-4">
                      <h4 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
                        {module}
                      </h4>
                      <div className="space-y-1">
                        {modulePermissions.map((perm) => (
                          <div
                            key={perm.id}
                            className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
                          >
                            <Checkbox
                              id={`perm-${perm.id}`}
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={() =>
                                handlePermissionToggle(perm.id)
                              }
                            />
                            <Label
                              htmlFor={`perm-${perm.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {perm.name}
                            </Label>
                            <Badge
                              className={
                                TYPE_BADGE_COLORS[perm.type] ??
                                "bg-gray-100 text-gray-700"
                              }
                            >
                              {perm.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && permissions.length > 0 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-500/50 bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedUserId || saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Permission"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
