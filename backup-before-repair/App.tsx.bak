import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import ExpensesPage from "@/pages/ExpensesPage"; // ← the page you were seeing
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ExpensesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
