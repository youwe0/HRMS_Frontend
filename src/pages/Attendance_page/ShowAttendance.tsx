import { useEffect, useState } from "react";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { decodeTokenPayload } from "@/lib/utils";

type AttendanceRecord = {
  employeeCode: string;
  attendanceDate: string;
  clockIn: string | null;
  clockOut: string | null;
  shift: string | null;
  status: string | null;
  isActive: number;
  createdAt: string;
};

type AttendanceApiResponse = {
  attendance: AttendanceRecord[];
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTime(isoString: string | null): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFirstDayOfMonth(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-01`;
}

function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

function getWeekDay(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function ShowAttendance() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const userPayload = decodeTokenPayload();
      if (!userPayload?.userId) {
        if (!cancelled) {
          setError("Unable to identify user.");
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError("");
      }

      try {
        const fromDate = getFirstDayOfMonth(selectedYear, selectedMonth);
        const toDate = getLastDayOfMonth(selectedYear, selectedMonth);

        const data = await api.get<AttendanceApiResponse>(
          API_ENDPOINTS.GET_ATTENDANCE(userPayload.userId),
          { fromDate, toDate },
        );

        if (!cancelled) {
          setRecords(data.attendance || []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const apiErr = err as { message?: string };
          setError(apiErr.message || "Failed to load attendance.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth, selectedYear]);

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Check if the selected month is the current month (disable "next" if so)
  const isCurrentMonth =
    selectedMonth === now.getMonth() && selectedYear === now.getFullYear();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-5" />
          Attendance History
        </CardTitle>
        <CardDescription>
          View your attendance records for the selected month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Month / Year Navigation */}
        <div className="mb-4 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="min-w-45 text-center">
            <span className="text-lg font-semibold">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin mr-2" />
            Loading attendance…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : records.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">
            No attendance records found for this month.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={`${record.employeeCode}-${record.attendanceDate}`}>
                    <TableCell className="font-medium">
                      {formatDate(record.attendanceDate)}
                    </TableCell>
                    <TableCell>{getWeekDay(record.attendanceDate)}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatTime(record.clockIn)}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatTime(record.clockOut)}
                    </TableCell>
                    <TableCell>
                      {record.shift || (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.status ? (
                        <Badge variant="secondary">{record.status}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
