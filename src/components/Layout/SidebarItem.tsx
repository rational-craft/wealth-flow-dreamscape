import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useSidebarContext } from "./Sidebar";

interface Props {
  to: string;
  icon: ReactNode;
  label: string;
}

export default function SidebarItem({ to, icon, label }: Props) {
  const { collapsed } = useSidebarContext();
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors group hover:bg-white/10 ${
          isActive
            ? "font-bold border-l-4 border-indigo-500 bg-white/10"
            : "text-white/80"
        }`
      }
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span
        className={`flex-1 transition-opacity ${collapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
      >
        {label}
      </span>
    </NavLink>
  );
}
