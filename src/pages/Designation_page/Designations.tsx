import { useCallback, useEffect, useState } from "react";
import { Loader2, Briefcase, Trash2 } from "lucide-react";
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
import { AddDesignationDialog } from "@/pages/Designation_page/AddDesignationDialog";
import { DeleteDesignationDialog } from "@/pages/Designation_page/DeleteDesignationDialog";
import { createModuleCache } from "@/lib/indexedDb";

type Designation = {
  id: number;
  designation: string;
  isActive: number;
};

type DesignationsResponse = {
  designations: Designation[];
};

const designationCache = createModuleCache<Designation[]>("designations");

export default function DesignationsPage() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDesig, setSelectedDesig] = useState<Designation | null>(null);

  const fetchDesignations = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError("");

    try {
      // Try IndexedDB cache first (unless a fresh fetch is forced).
      if (!forceRefresh) {
        const cached = await designationCache.get();
        if (cached && cached.length > 0) {
          setDesignations(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss or force-refresh: fetch from the API.
      const data = await api.get<DesignationsResponse>(
        API_ENDPOINTS.GET_DESIGNATIONS,
      );
      setDesignations(data.designations);
      await designationCache.save(data.designations);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message || "Failed to load designations.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) {
        await fetchDesignations();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchDesignations]);

  return (
    <PageLayout>
      <Header
        title="Designations"
        description="Manage designations in the organization."
        showBack={true}
      />
      <div className="flex items-center justify-end">
        <Button size="lg" className="mt-1" onClick={() => setDialogOpen(true)}>
          <Briefcase className="size-4" />
          Add Designation
        </Button>
      </div>
      <AddDesignationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={async () => {
          await designationCache.clear();
          await fetchDesignations(true);
        }}
      />
      <DeleteDesignationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        designationId={selectedDesig?.id ?? null}
        designationName={selectedDesig?.designation ?? ""}
        onDeleted={async () => {
          await designationCache.clear();
          await fetchDesignations(true);
        }}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Designations</CardTitle>
          <CardDescription>
            List of all designations in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading designations…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : designations.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No designations found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {designations.map((desig) => (
                  <TableRow key={desig.id}>
                    <TableCell className="font-medium">#{desig.id}</TableCell>
                    <TableCell>{desig.designation}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          desig.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                        }
                      >
                        {desig.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="delete-icon-button"
                        size="icon"
                        onClick={() => {
                          setSelectedDesig(desig);
                          setDeleteDialogOpen(true);
                        }}
                        aria-label="Delete designation"
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
