import { useState } from "react";
import { Loader2, LogIn, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/api/client";
import { API_ENDPOINTS } from "@/config/endpoints";
import { decodeTokenPayload } from "@/lib/utils";

type AttendanceRecord = {
  employeeCode: string;
  attendanceDate: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string | null;
};

type AttendanceResponse = {
  attendance: AttendanceRecord;
};

export function MakeAttendance() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [lastAction, setLastAction] = useState<
    "clock_in" | "clock_out" | "completed" | null
  >(null);

  const handlePunch = async () => {
    const userPayload = decodeTokenPayload();
    if (!userPayload?.userId) {
      setMessage("Unable to identify user. Please log in again.");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const clockTime = new Date().toISOString();
      const data = await api.post<AttendanceResponse>(
        API_ENDPOINTS.MAKE_ATTENDANCE(userPayload.userId),
        { clockTime },
      );

      if (data.attendance) {
        if (data.attendance.clockIn && !data.attendance.clockOut) {
          setMessage("Clock-in recorded successfully!");
          setIsError(false);
          setLastAction("clock_in");
        } else if (data.attendance.clockIn && data.attendance.clockOut) {
          setMessage("Clock-out recorded successfully!");
          setIsError(false);
          setLastAction("clock_out");
        }
      }
    } catch (err: unknown) {
      const apiErr = err as { status?: number; message?: string };
      if (apiErr.status === 409) {
        setMessage("Attendance completed, try tomorrow");
        setIsError(false);
        setLastAction("completed");
      } else {
        setMessage(apiErr.message || "Failed to record attendance.");
        setIsError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="size-5" />
          Punch Attendance
        </CardTitle>
        <CardDescription>
          Clock in when you arrive and clock out when you leave.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Button
          size="lg"
          className="w-full max-w-xs text-base"
          onClick={handlePunch}
          disabled={loading || lastAction === "completed"}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : lastAction === "clock_in" ? (
            <LogOut className="size-4" />
          ) : lastAction === "completed" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <LogIn className="size-4" />
          )}
          {loading
            ? "Processing..."
            : lastAction === "clock_in"
              ? "Clock Out"
              : lastAction === "completed"
                ? "Completed for Today"
                : "Clock In"}
        </Button>

        {message && (
          <p
            className={`text-sm font-medium ${
              isError ? "text-destructive" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
