import { AppSidebar } from "@/components/layout/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  // SidebarTrigger,
} from "@/components/ui/sidebar";

function App() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        {/* <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header> */}
        <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            HRMS Frontend
          </h1>
          <p>Backend: under development</p>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
