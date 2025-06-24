import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sidebar:collapsed";

export function useSidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const updateStorage = useCallback((value: boolean) => {
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      updateStorage(next);
      return next;
    });
  }, [updateStorage]);

  const collapse = useCallback(() => {
    setCollapsed(true);
    updateStorage(true);
  }, [updateStorage]);

  const expand = useCallback(() => {
    setCollapsed(false);
    updateStorage(false);
  }, [updateStorage]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggle]);

  return { collapsed, toggle, collapse, expand };
}
