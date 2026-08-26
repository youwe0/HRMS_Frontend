import { useCallback, useEffect, useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { Header } from "@/components/layout/Header";
import { AddDepartmentDialog } from "@/pages/Department_page/AddDepartmentDialog";

type Department = {
  id: number;
  department: string;
  hod: number | null;
  createdAt: string;
  createdBy: number;
  isActive: number;
};

type DepartmentsResponse = {
  departments: Department[];
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<DepartmentsResponse>(
        API_ENDPOINTS.CREATE_DEPARTMENT,
      );
      setDepartments(data.departments);
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
    <div className="flex flex-1 flex-col gap-6 p-6">
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
        onCreated={() => fetchDepartments()}
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((dept) => (
                <Card key={dept.id} className="overflow-hidden py-3">
                  <CardContent className="flex items-center justify-between gap-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Building2 className="size-5" />
                      </div>
                      <span className="truncate font-medium">
                        {dept.department}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        #{dept.id}
                      </span>
                      <Badge
                        variant={dept.isActive ? "secondary" : "destructive"}
                      >
                        {dept.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
