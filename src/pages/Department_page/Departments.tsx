import { useCallback, useEffect, useState } from "react";
import { Loader2, Building2, Trash2, Pencil } from "lucide-react";
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
import { AddDepartmentDialog } from "@/pages/Department_page/AddDepartmentDialog";
import { DeleteDepartmentDialog } from "@/pages/Department_page/DeleteDepartmentDialog";
import { EditDepartmentDialog } from "@/pages/Department_page/EditDepartmentDialog";
import { createModuleCache } from "@/lib/indexedDb";

type Department = {
  id: number;
  department: string;
  isActive: number;
};

type DepartmentsResponse = {
  departments: Department[];
};

const departmentCache = createModuleCache<Department[]>("departments");

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const fetchDepartments = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError("");

    try {
      // Try IndexedDB cache first (unless a fresh fetch is forced).
      if (!forceRefresh) {
        const cached = await departmentCache.get();
        if (cached && cached.length > 0) {
          setDepartments(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss or force-refresh: fetch from the API.
      const data = await api.get<DepartmentsResponse>(
        API_ENDPOINTS.GET_DEPARTMENTS,
      );
      setDepartments(data.departments);
      await departmentCache.save(data.departments);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message || "Failed to load departments.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) {
        await fetchDepartments();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchDepartments]);

  return (
    <PageLayout>
      <Header
        title="Departments"
        description="Manage departments in the organization."
        showBack={true}
      />
      <div className="flex items-center justify-end">
        <Button size="lg" className="mt-1" onClick={() => setDialogOpen(true)}>
          <Building2 className="size-4" />
          Add Department
        </Button>
      </div>
      <AddDepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={async () => {
          await departmentCache.clear();
          await fetchDepartments(true);
        }}
      />
      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        departmentId={selectedDept?.id ?? null}
        departmentName={selectedDept?.department ?? ""}
        onDeleted={async () => {
          await departmentCache.clear();
          await fetchDepartments(true);
        }}
      />
      <EditDepartmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
          <CardDescription>
            List of all departments in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading departments…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : departments.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No departments found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">#{dept.id}</TableCell>
                    <TableCell>{dept.department}</TableCell>
                    <TableCell>
                      <Badge
                        className={dept.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"}
                      >
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="edit-icon-button"
                          size="icon"
                          onClick={() => setEditDialogOpen(true)}
                          aria-label="Edit department"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="delete-icon-button"
                          size="icon"
                          onClick={() => {
                            setSelectedDept(dept);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label="Delete department"
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
