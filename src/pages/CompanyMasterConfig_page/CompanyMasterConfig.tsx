import { useState } from "react";
import { Loader2, Settings } from "lucide-react";
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
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";
import { useResourceBundle } from "@/hooks/useResourceBundle";

export default function CompanyMasterConfigPage() {
  const { data: resourceBundle, loading } = useResourceBundle();
  const [holidayBasedOn, setHolidayBasedOn] = useState<string>("");

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
            Holiday Configuration
          </CardTitle>
          <CardDescription>
            Select how holidays are classified in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="size-4 animate-spin mr-2" />
              Loading configuration…
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Holiday Based On Type
                </label>
                <Select
                  value={holidayBasedOn}
                  onValueChange={setHolidayBasedOn}
                >
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Select holiday type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(resourceBundle?.HolidayBasedOnType ?? []).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Determines the granularity for defining holidays (e.g. by
                  State, City, or Zone).
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
