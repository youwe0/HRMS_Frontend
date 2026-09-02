import { useEffect, useState } from "react";
import { Loader2, Settings, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import { api, ApiError } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { createModuleCache } from "@/lib/indexedDb";

type CompanyMasterConfigRecord = {
  id: number;
  moduleName: string;
  basedOn: string;
  createdBy: number;
  createdAt: string;
  isActive: number;
};

const configCache = createModuleCache<CompanyMasterConfigRecord[]>(
  "companyMasterConfig",
);

export default function CompanyMasterConfigPage() {
  const { toasts, dismiss, error: toastError } = useToast();
  const [configs, setConfigs] = useState<CompanyMasterConfigRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Try IndexedDB first
      const cached = await configCache.get();
      if (cached) {
        setConfigs(cached);
        setLoading(false);

        // Still try API in background to refresh cache
        try {
          const response = await api.get<{
            configs: CompanyMasterConfigRecord[];
          }>(API_ENDPOINTS.GET_COMPANY_MASTER_CONFIG);
          setConfigs(response.configs);
          await configCache.save(response.configs);
        } catch {
          // Background refresh failed — ignore, we have cached data
        }
        return;
      }

      // 2. No cache — fetch from API
      const response = await api.get<{
        configs: CompanyMasterConfigRecord[];
      }>(API_ENDPOINTS.GET_COMPANY_MASTER_CONFIG);
      setConfigs(response.configs);
      await configCache.save(response.configs);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to load configuration.";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!cancelled) await loadConfig();
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PageLayout>
      <Header
        title="Company Master Config"
        description="Configure company-wide master settings."
        showBack={true}
      />

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="size-5" />
            Company Master Configuration
          </CardTitle>
          <CardDescription>
            All saved company master configuration entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading configuration…
            </div>
          ) : error && configs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-muted-foreground text-center">
                {error}
              </p>
              <Button variant="outline" size="sm" onClick={loadConfig}>
                Retry
              </Button>
            </div>
          ) : configs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No configuration entries found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Based On</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((cfg) => (
                  <TableRow key={cfg.id}>
                    <TableCell>{cfg.id}</TableCell>
                    <TableCell>{cfg.moduleName}</TableCell>
                    <TableCell>{cfg.basedOn}</TableCell>
                    <TableCell>{cfg.createdBy}</TableCell>
                    <TableCell>
                      {new Date(cfg.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageLayout>
  );
}
