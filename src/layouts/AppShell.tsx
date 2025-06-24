import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
