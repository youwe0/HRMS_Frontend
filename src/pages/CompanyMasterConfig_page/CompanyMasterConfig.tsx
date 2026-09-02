import { useEffect, useState } from "react";
import { Loader2, Settings, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import { useResourceBundle } from "@/hooks/useResourceBundle";
import { api, ApiError } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { ToastContainer, useToast } from "@/components/ui/toast";
import {
  COMPANY_MASTER_OPTIONS,
  type CompanyMasterOption,
} from "@/config/CompanyMasterOptionConfig";

type CompanyMasterConfigRecord = {
  id: number;
  moduleName: string;
  basedOn: string;
};

export default function CompanyMasterConfigPage() {
  const { data: resourceBundle, loading } = useResourceBundle();
  const { toasts, dismiss, success, error: toastError } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Load existing configs on mount
  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await api.get<{
          configs: CompanyMasterConfigRecord[];
        }>(API_ENDPOINTS.GET_COMPANY_MASTER_CONFIG);
        if (!cancelled && response.configs.length > 0) {
          const map: Record<string, string> = {};
          for (const cfg of response.configs) {
            map[cfg.moduleName] = cfg.basedOn;
          }
          setValues(map);
        }
      } catch {
        // Silently fail — user can still select and save
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleValueChange = (moduleName: string, value: string) => {
    setValues((prev) => ({ ...prev, [moduleName]: value }));
  };

  const handleSave = async (option: CompanyMasterOption) => {
    const currentValue = values[option.moduleName];
    if (!currentValue) {
      toastError(`Please select a ${option.label} before saving.`);
      return;
    }

    setSaving(true);
    try {
      await api.post(API_ENDPOINTS.UPSERT_COMPANY_MASTER_CONFIG, {
        moduleName: option.moduleName,
        basedOn: currentValue,
      });
      success(`${option.label} saved successfully.`);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to save configuration.";
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loading || loadingConfig;

  return (
    <PageLayout>
      <Header
        title="Company Master Config"
        description="Configure company-wide master settings."
        showBack={true}
      />

      <div className="flex flex-col gap-4 w-full">
        {COMPANY_MASTER_OPTIONS.map((option) => (
          <Card key={option.moduleName} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5" />
                {option.title}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Loading configuration…
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">
                      {option.label}
                    </label>
                    <Select
                      value={values[option.moduleName] ?? ""}
                      onValueChange={(v) =>
                        handleValueChange(option.moduleName, v)
                      }
                    >
                      <SelectTrigger className="w-full max-w-sm">
                        <SelectValue placeholder={option.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(resourceBundle?.[option.resourceBundleKey] ?? []).map(
                          (type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {option.helperText}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave(option)}
                      disabled={saving || !values[option.moduleName]}
                    >
                      {saving ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <Save className="size-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </PageLayout>
  );
}
