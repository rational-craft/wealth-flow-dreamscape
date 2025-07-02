import { ReactNode, useCallback, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useSidebarContext } from "./Sidebar";

interface Props {
  title: string;
  children: ReactNode;
}

export default function SidebarSection({ title, children }: Props) {
  const { collapsed, register, toggleAll } = useSidebarContext();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const fn = (open: boolean) => setExpanded(open);
    register(fn);
  }, [register]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.metaKey || e.shiftKey) {
        toggleAll(!expanded);
        setExpanded(!expanded);
      } else {
        setExpanded((prev) => !prev);
      }
    },
    [expanded, toggleAll],
  );

  return (
    <div>
      <button
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`text-left flex-1 ${collapsed ? "opacity-0 group-hover:opacity-100" : ""}`}
        >
          {title}
        </span>
        <ChevronRight
          className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : "rotate-0"} ${collapsed ? "opacity-0 group-hover:opacity-100" : ""}`}
        />
      </button>
      <div className={`${expanded ? "block" : "hidden"} pl-1 space-y-1`}>
        {children}
      </div>
    </div>
  );
}
