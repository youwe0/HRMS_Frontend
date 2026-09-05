import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  AddPermissionDialog,
  type PermissionData,
} from "@/pages/RolesPermissions_page/AddPermissionDialog";
import { DeletePermissionDialog } from "@/pages/RolesPermissions_page/DeletePermissionDialog";
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
  createdAt: string;
  createdBy: number;
};

type PermissionsResponse = {
  permissions: Permission[];
};

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

export default function RolesPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPerm, setSelectedPerm] = useState<Permission | null>(null);
  const [editPerm, setEditPerm] = useState<PermissionData | null>(null);

  const fetchPermissions = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError("");

    try {
      if (!forceRefresh) {
        const cached = await permissionsCache.get();
        if (cached && cached.length > 0) {
          setPermissions(cached);
          setLoading(false);
          return;
        }
      }

      const data = await api.get<PermissionsResponse>(
        API_ENDPOINTS.GET_PERMISSIONS,
      );
      setPermissions(data.permissions);
      await permissionsCache.save(data.permissions);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message ||
        "Failed to load permissions.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) {
        await fetchPermissions();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchPermissions]);

  const handleEdit = (perm: Permission) => {
    setEditPerm({
      id: perm.id,
      code: perm.code,
      name: perm.name,
      type: perm.type,
      module: perm.module,
      parentCode: perm.parentCode,
      isActive: perm.isActive,
    });
    setEditDialogOpen(true);
  };

  return (
    <PageLayout>
      <Header
        title="Roles & Permissions"
        description="Manage RBAC permissions for the system."
        showBack={true}
      />
      <div className="flex items-center justify-end">
        <Button
          size="lg"
          className="mt-1"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="size-4" />
          Add Permission
        </Button>
      </div>

      {/* Create dialog */}
      <AddPermissionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={async () => {
          await permissionsCache.clear();
          await fetchPermissions(true);
        }}
      />

      {/* Edit dialog */}
      <AddPermissionDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editData={editPerm}
        onCreated={async () => {
          setEditPerm(null);
          await permissionsCache.clear();
          await fetchPermissions(true);
        }}
      />

      {/* Delete dialog */}
      <DeletePermissionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        permissionId={selectedPerm?.id ?? null}
        permissionCode={selectedPerm?.code ?? ""}
        onDeleted={async () => {
          await permissionsCache.clear();
          await fetchPermissions(true);
        }}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            All Permissions
          </CardTitle>
          <CardDescription>
            Permissions define what actions roles can perform in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Parent Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-36" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="size-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : permissions.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No permissions found. Click "Add Permission" to create one.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Parent Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm.id}>
                    <TableCell className="font-medium">#{perm.id}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {perm.code}
                      </code>
                    </TableCell>
                    <TableCell>{perm.name}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          TYPE_BADGE_COLORS[perm.type] ??
                          "bg-gray-100 text-gray-700"
                        }
                      >
                        {perm.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{perm.module}</TableCell>
                    <TableCell>
                      {perm.parentCode ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {perm.parentCode}
                        </code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          perm.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {perm.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(perm)}
                          aria-label="Edit permission"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="delete-icon-button"
                          size="icon"
                          onClick={() => {
                            setSelectedPerm(perm);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label="Delete permission"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
