import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, CalendarOff, Trash2, Plus } from "lucide-react";
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
import { AddLeaveTypeDialog } from "@/pages/LeaveType_page/AddLeaveTypeDialog";
import { DeleteLeaveTypeDialog } from "@/pages/LeaveType_page/DeleteLeaveTypeDialog";
import { createModuleCache } from "@/lib/indexedDb";

type LeaveType = {
  id: number;
  leaveName: string;
  leaveCode: string;
  applicableFor: string | null;
  isActive: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type LeaveTypesResponse = {
  leaveTypes: LeaveType[];
  pagination: Pagination;
};

const leaveTypeCache = createModuleCache<LeaveType[]>("leaveTypes");

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const LIMIT = 10;

  // Fetch a single page from the API
  const fetchPage = useCallback(
    async (page: number): Promise<LeaveTypesResponse | null> => {
      try {
        const data = await api.get<LeaveTypesResponse>(
          API_ENDPOINTS.GET_LEAVE_TYPES,
          { page, limit: LIMIT },
        );
        return data;
      } catch {
        return null;
      }
    },
    [],
  );

  // Initial load — try cache, then fetch page 1
  const fetchInitial = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Try IndexedDB cache first
      const cached = await leaveTypeCache.get();
      if (cached && cached.length > 0) {
        setLeaveTypes(cached);
        // Still need pagination info — fetch page 1 to get total
        const firstPage = await fetchPage(1);
        if (firstPage) {
          setTotalPages(firstPage.pagination.totalPages);
          setHasMore(firstPage.pagination.totalPages > 1);
          setCurrentPage(1);
        }
        setLoading(false);
        return;
      }

      // Cache miss — fetch from API
      const firstPage = await fetchPage(1);
      if (firstPage) {
        setLeaveTypes(firstPage.leaveTypes);
        setTotalPages(firstPage.pagination.totalPages);
        setHasMore(firstPage.pagination.totalPages > 1);
        setCurrentPage(1);
        await leaveTypeCache.save(firstPage.leaveTypes);
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message ||
        "Failed to load leave types.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  // Load next page (infinite scroll)
  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = currentPage + 1;
      const data = await fetchPage(nextPage);
      if (data && data.leaveTypes.length > 0) {
        setLeaveTypes((prev) => [...prev, ...data.leaveTypes]);
        setCurrentPage(nextPage);
        setHasMore(nextPage < data.pagination.totalPages);
        // Update IndexedDB cache with accumulated data
        await leaveTypeCache.save([...leaveTypes, ...data.leaveTypes]);
      } else {
        setHasMore(false);
      }
    } catch {
      // silently fail on next page load
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, fetchPage, leaveTypes]);

  // Refresh — clear cache and re-fetch everything
  const refreshData = useCallback(async () => {
    await leaveTypeCache.clear();
    setLeaveTypes([]);
    setCurrentPage(1);
    setHasMore(true);
    await fetchInitial();
  }, [fetchInitial]);

  // Initial load on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cancelled) {
        await fetchInitial();
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchInitial]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loadingMore, loading, fetchNextPage]);

  return (
    <PageLayout>
      <Header
        title="Leave Management"
        description="Manage leave types in the organization."
        showBack={true}
      />
      <div className="flex items-center justify-end">
        <Button size="lg" className="mt-1" onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add Leave Type
        </Button>
      </div>
      <AddLeaveTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={refreshData}
      />
      <DeleteLeaveTypeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        leaveTypeId={selectedLeaveType?.id ?? null}
        leaveTypeName={selectedLeaveType?.leaveName ?? ""}
        onDeleted={refreshData}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Leave Types</CardTitle>
          <CardDescription>
            List of all leave types in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading leave types…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : leaveTypes.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No leave types found.
            </p>
          ) : (
            <>
              <Table>                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave Name</TableHead>
                    <TableHead>Leave Code</TableHead>
                    <TableHead>Applicable For</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map((lt) => (
                    <TableRow key={lt.leaveCode}>
                      <TableCell>{lt.leaveName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lt.leaveCode}</Badge>
                      </TableCell>
                      <TableCell>
                        {lt.applicableFor || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            lt.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {lt.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="delete-icon-button"
                          size="icon"
                          onClick={() => {
                            setSelectedLeaveType(lt);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label="Delete leave type"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {loadingMore && (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Loading more…
                </div>
              )}

              {!hasMore && leaveTypes.length > 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  All leave types loaded.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
