import { createContext, useCallback, useContext, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Settings,
  Database,
  Folder,
  Plug,
  CreditCard,
  BookOpen,
  Sparkle,
  Menu as MenuIcon,
} from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";

interface SidebarContextValue {
  collapsed: boolean;
  toggle: () => void;
  register: (fn: (expand: boolean) => void) => void;
  toggleAll: (expand: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);
export const useSidebarContext = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar components must be used within Sidebar");
  return ctx;
};

export default function Sidebar() {
  const sidebar = useSidebar();
  const [sections, setSections] = useState<((expand: boolean) => void)[]>([]);

  const register = useCallback((fn: (expand: boolean) => void) => {
    setSections((prev) => [...prev, fn]);
  }, []);

  const toggleAll = useCallback(
    (expand: boolean) => sections.forEach((fn) => fn(expand)),
    [sections]
  );

  const value: SidebarContextValue = {
    collapsed: sidebar.collapsed,
    toggle: sidebar.toggle,
    register,
    toggleAll,
  };

  return (
    <SidebarContext.Provider value={value}>
      <aside
        className={`group flex h-screen flex-col bg-[#0F172A]/85 text-white transition-all duration-200 ease-in-out ${sidebar.collapsed ? "w-[72px] hover:w-64" : "w-64"}`}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <button onClick={sidebar.toggle} aria-label="Toggle Sidebar">
            <MenuIcon className="w-5 h-5" />
          </button>
          <span
            className={`text-sm font-semibold transition-opacity ${sidebar.collapsed ? "opacity-0 group-hover:opacity-100" : ""}`}
          >
            Menu
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto pb-2 space-y-2">
          <SidebarSection title="Models">
            <SidebarItem to="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
          </SidebarSection>
          <SidebarSection title="Databases">
            <SidebarItem to="#" icon={<Database />} label="Data" />
          </SidebarSection>
          <SidebarSection title="Pages">
            <SidebarItem to="/" icon={<FileText />} label="Expenses" />
            <SidebarItem to="/income" icon={<DollarSign />} label="Income" />
            <SidebarItem to="/settings" icon={<Settings />} label="Settings" />
          </SidebarSection>
        </nav>
        <div className="border-t border-white/20 p-2 space-y-1">
          <SidebarItem to="#" icon={<Plug />} label="Integrations" />
          <SidebarItem to="#" icon={<CreditCard />} label="Plans" />
          <SidebarItem to="#" icon={<BookOpen />} label="Templates" />
          <SidebarItem to="#" icon={<Sparkle />} label="What's New" />
        </div>
      </aside>
    </SidebarContext.Provider>
  );
}
