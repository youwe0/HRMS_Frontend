import {
  CalendarDays,
  Cake,
  Gift,
  Megaphone,
  PartyPopper,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";

// ──────────────────────────────────────────────
// Dummy data — replace with real API calls later
// ──────────────────────────────────────────────

const stats = [
  { label: "Total Employees", value: 148, icon: Users, color: "text-blue-600" },
  { label: "Present Today", value: 132, icon: TrendingUp, color: "text-green-600" },
  { label: "On Leave", value: 12, icon: CalendarDays, color: "text-amber-600" },
  { label: "Pending Requests", value: 5, icon: Megaphone, color: "text-purple-600" },
];

const attendance = {
  present: 132,
  absent: 4,
  late: 8,
  workFromHome: 4,
  total: 148,
};

const leaveBalance = [
  { type: "Casual Leave", used: 4, total: 12 },
  { type: "Sick Leave", used: 2, total: 8 },
  { type: "Earned Leave", used: 1, total: 15 },
  { type: "Maternity Leave", used: 0, total: 26 },
];

const upcomingHolidays = [
  { date: "2026-09-05", name: "Ganesh Chaturthi", day: "Friday" },
  { date: "2026-10-02", name: "Gandhi Jayanti", day: "Thursday" },
  { date: "2026-10-20", name: "Dussehra", day: "Tuesday" },
  { date: "2026-11-01", name: "Diwali", day: "Sunday" },
];

const pendingRequests = [
  { name: "Rahul Sharma", type: "Casual Leave", dates: "Aug 28 – Aug 29", status: "Pending" as const },
  { name: "Priya Patel", type: "Work From Home", dates: "Aug 26", status: "Pending" as const },
  { name: "Amit Singh", type: "Sick Leave", dates: "Aug 27 – Aug 30", status: "Pending" as const },
  { name: "Neha Gupta", type: "Casual Leave", dates: "Sep 1 – Sep 2", status: "Pending" as const },
  { name: "Vikram Rao", type: "Earned Leave", dates: "Sep 5 – Sep 10", status: "Pending" as const },
];

const announcements = [
  { title: "Office Timing Update", date: "Aug 24, 2026", description: "Effective Sept 1, office hours shift to 9:30 AM – 6:30 PM." },
  { title: "Annual Day Celebration", date: "Aug 22, 2026", description: "Annual day will be celebrated on Oct 15. Stay tuned for details." },
  { title: "New Health Insurance Policy", date: "Aug 20, 2026", description: "Updated health insurance coverage now includes dental benefits." },
];

const birthdays = [
  { name: "Sneha Reddy", date: "Aug 26", role: "UI Designer" },
  { name: "Karan Mehta", date: "Aug 28", role: "Backend Developer" },
  { name: "Anjali Nair", date: "Sep 1", role: "HR Manager" },
];

const workAnniversaries = [
  { name: "Rohit Verma", date: "Aug 27", years: 3, role: "Team Lead" },
  { name: "Pooja Desai", date: "Aug 30", years: 5, role: "Senior Analyst" },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export default function DashboardPage() {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageLayout>
      <Header title="Dashboard" description={today} showBack={false} />

      {/* ── Quick Stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted ${s.color}`}>
                <s.icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Today's Attendance ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall</span>
              <span className="font-medium">
                {attendance.present}/{attendance.total} present
              </span>
            </div>
            <Progress value={(attendance.present / attendance.total) * 100} />

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/40">
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{attendance.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/40">
                <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{attendance.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/40">
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{attendance.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Work From Home</span>
              <span className="font-medium">{attendance.workFromHome} employees</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Leave Balance ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveBalance.map((lb) => (
              <div key={lb.type} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{lb.type}</span>
                  <span className="text-muted-foreground">
                    {lb.used}/{lb.total} used
                  </span>
                </div>
                <Progress value={(lb.used / lb.total) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Upcoming Holidays ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingHolidays.map((h) => (
                <div key={h.date} className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-[10px] leading-none font-medium uppercase">
                      {new Date(h.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                    <span className="text-sm leading-tight font-bold">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.day}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Pending Leave Requests ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((r) => (
                <div key={r.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.type} · {r.dates}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Announcements ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.title} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Megaphone className="size-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium">{a.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.description}</p>
                  <p className="text-[11px] text-muted-foreground/70">{a.date}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Birthdays & Work Anniversaries ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Celebrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Birthdays */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Cake className="size-3.5" /> Birthdays
              </div>
              <div className="space-y-2">
                {birthdays.map((b) => (
                  <div key={b.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      <p className="text-xs text-muted-foreground">{b.role}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Gift className="size-3" />
                      {b.date}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Anniversaries */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <PartyPopper className="size-3.5" /> Work Anniversaries
              </div>
              <div className="space-y-2">
                {workAnniversaries.map((w) => (
                  <div key={w.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.role}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <PartyPopper className="size-3" />
                      {w.years} yr{w.years > 1 ? "s" : ""} · {w.date}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
