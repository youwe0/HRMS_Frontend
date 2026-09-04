import { useCallback, useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { createModuleCache } from "@/lib/indexedDb";
import { Skeleton } from "@/components/ui/skeleton";

type EmploymentDetails = {
  id: number;
  userId: number;
  employeeCode: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  createdBy: number;
  createdAt: string;
};

type EmploymentDetailsResponse = {
  employmentDetails: EmploymentDetails;
};

const employmentDetailsCache =
  createModuleCache<EmploymentDetails>("employmentDetails");

export default function MyProfilePage() {
  const [details, setDetails] = useState<EmploymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetails = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError("");

    try {
      // Try IndexedDB cache first (unless a fresh fetch is forced).
      if (!forceRefresh) {
        const cached = await employmentDetailsCache.get();
        if (cached) {
          setDetails(cached);
          setLoading(false);
          return;
        }
      }

      // Cache miss or force-refresh: fetch from the API.
      const data = await api.get<EmploymentDetailsResponse>(
        API_ENDPOINTS.GET_USER_DETAIL("employment-details"),
      );
      setDetails(data.employmentDetails);
      await employmentDetailsCache.save(data.employmentDetails);
    } catch (err: unknown) {
      const msg =
        (err as { message?: string }).message ||
        "Failed to load employment details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!cancelled) {
        await fetchDetails();
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchDetails]);

  return (
    <PageLayout>
      <Header
        title="My Profile"
        description="Your employment details."
        showBack={true}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            Employment Details
          </CardTitle>
          <CardDescription>
            Your employment information as recorded in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-40" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : !details ? (
            <p className="py-6 text-center text-muted-foreground">
              No employment details found.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Employee Code */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Employee Code
                </p>
                <p className="text-base font-semibold">
                  {details.employeeCode}
                </p>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Department
                </p>
                <p className="text-base">{details.department}</p>
              </div>

              {/* Designation */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Designation
                </p>
                <p className="text-base">{details.designation}</p>
              </div>

              {/* Date of Joining */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Date of Joining
                </p>
                <p className="text-base">
                  {new Date(details.dateOfJoining).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* User ID */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  User ID
                </p>
                <Badge variant="secondary">#{details.userId}</Badge>
              </div>

              {/* Created At */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Record Created
                </p>
                <p className="text-base text-muted-foreground">
                  {new Date(details.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
