import { NavLink } from "react-router-dom";
import { Home, FileText, DollarSign, Settings as SettingsIcon } from "lucide-react";

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium hover:bg-muted ${
    isActive ? "bg-muted" : ""
  }`;

export default function Sidebar() {
  return (
    <aside className="bg-card h-screen border-r w-56 hidden md:block sticky top-0">
      <nav className="flex flex-col gap-1 p-2">
        <NavLink to="/dashboard" className={linkClasses} end>
          <Home className="w-4 h-4" /> Dashboard
        </NavLink>
        <NavLink to="/expenses" className={linkClasses} end>
          <FileText className="w-4 h-4" /> Expenses
        </NavLink>
        <NavLink to="/income" className={linkClasses}>
          <DollarSign className="w-4 h-4" /> Income
        </NavLink>
        <NavLink to="/settings" className={linkClasses}>
          <SettingsIcon className="w-4 h-4" /> Settings
        </NavLink>
      </nav>
    </aside>
  );
}
