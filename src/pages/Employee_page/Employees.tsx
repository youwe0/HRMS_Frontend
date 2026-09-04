import { useCallback, useEffect, useState } from "react";
import { Pencil, UserPlus } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import { AddEmployeeDialog } from "@/pages/Employee_page/AddEmployeeDialog";
import { EditEmploymentDetailsDialog } from "@/pages/Employee_page/EditEmploymentDetailsDialog";
import { createModuleCache } from "@/lib/indexedDb";
import { Skeleton } from "@/components/ui/skeleton";

type Employee = {
  userId: number;
  userName: string;
  role: string;
  isActive: number;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type EmployeesResponse = {
  employees: Employee[];
  pagination: PaginationMeta;
};

const PAGE_LIMIT = 10;

// IndexedDB cache for the employee list.
const employeesCache = createModuleCache<Employee[]>("employees");

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchEmployees = useCallback(async (page: number) => {
    setEmployeesLoading(true);
    setEmployeesError("");
    try {
      const data = await api.get<EmployeesResponse>(
        API_ENDPOINTS.GET_EMPLOYEES,
        { page, limit: PAGE_LIMIT },
      );
      // Cache the employee list for the current page.
      await employeesCache.save(data.employees);
      setEmployees(data.employees);
      setPagination(data.pagination);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message || "Failed to load employees.";
      setEmployeesError(msg);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (cancelled) return;

      // Try cache first (only for the first page).
      if (currentPage === 1) {
        const cached = await employeesCache.get();
        if (cached && !cancelled) {
          setEmployees(cached);
          setEmployeesLoading(false);
          return;
        }
      }

      await fetchEmployees(currentPage);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentPage, fetchEmployees]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display (show max 5 pages around current)
  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return [];
    const { totalPages } = pagination;
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <PageLayout>
      <Header
        title="Employees"
        description="Register new employees into the system."
        showBack={true}
      />
      <div className="flex items-center justify-end">
        <Button size="lg" className="mt-1" onClick={() => setDialogOpen(true)}>
          <UserPlus className="size-4" />
          Add Employee
        </Button>
      </div>
      <AddEmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onRegistered={async () => {
          // Clear the cache so the next fetch gets fresh data.
          await employeesCache.clear();
          await fetchEmployees(currentPage);
        }}
      />
      {selectedEmployee && (
        <EditEmploymentDetailsDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          userId={selectedEmployee.userId}
          userName={selectedEmployee.userName}
          onUpdated={async () => {
            await employeesCache.clear();
            await fetchEmployees(currentPage);
          }}
        />
      )}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>
            List of all registered employees in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {employeesLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden py-3">
                    <CardContent className="flex items-center justify-between gap-3 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-10 shrink-0 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-3 w-6" />
                        <Skeleton className="h-5 w-14 rounded-full" />
                        <Skeleton className="size-8 shrink-0 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : employeesError ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {employeesError}
              </div>
            ) : employees.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No employees found.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {employees.map((emp) => {
                    const initials = emp.userName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <Card key={emp.userId} className="overflow-hidden py-3">
                        <CardContent className="flex items-center justify-between gap-3 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${emp.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}
                            >
                              {initials || "??"}
                            </div>
                            <span className="truncate font-medium">
                              {emp.userName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              #{emp.userId}
                            </span>
                            <Badge variant="secondary">{emp.role}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {getPageNumbers().map((pageNum, index) => (
                          <PaginationItem key={`${pageNum}-${index}`}>
                            {pageNum === "..." ? (
                              <span className="flex size-9 items-center justify-center text-muted-foreground">
                                …
                              </span>
                            ) : (
                              <PaginationLink
                                isActive={pageNum === currentPage}
                                onClick={() => handlePageChange(pageNum)}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                Math.min(
                                  pagination.totalPages,
                                  currentPage + 1,
                                ),
                              )
                            }
                            className={
                              currentPage === pagination.totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
      </Card>
    </PageLayout>
  );
}
