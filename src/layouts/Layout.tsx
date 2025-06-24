import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Layout/Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 bg-background text-foreground">
        <Outlet />
      </main>
    </div>
  );
}
