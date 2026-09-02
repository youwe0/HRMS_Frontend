import { MakeAttendance } from "@/pages/Attendance_page/MakeAttendance";
import { ShowAttendance } from "@/pages/Attendance_page/ShowAttendance";
import { Header } from "@/components/layout/Header";
import { PageLayout } from "@/components/layout/PageLayout";

export default function AttendancePage() {
  return (
    <PageLayout>
      <Header
        title="Attendance"
        description="Track your daily attendance and view history."
        showBack={true}
      />
      {/* Clock In / Out */}
      <MakeAttendance />
      {/* Attendance History Table */}
      <ShowAttendance />
    </PageLayout>
  );
}
