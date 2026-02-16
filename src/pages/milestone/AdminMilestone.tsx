import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import TemplatesListPage from "./TemplatesListPage";
import DailyChecklistPage from "./DailyChecklistPage";
const AdminMilestone = () => {
  const [view, setView] = useState<"templates" | "daily">("templates");

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-background p-6">
      <TitleHeader
        title="Milestone"
        description="Manage milestones and checkpoints for all employees"
      />

      {/* Toggle buttons */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView("templates")}
          className={`rounded px-4 py-2 ${
            view === "templates" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Phase Templates
        </button>
        <button
          onClick={() => setView("daily")}
          className={`rounded px-4 py-2 ${
            view === "daily" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          Checklist
        </button>
      </div>

      {/* Render the selected view */}
      {view === "templates" ? <TemplatesListPage /> : <DailyChecklistPage />}
    </main>
  );
};

export default AdminMilestone;
