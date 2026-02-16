import { useState } from "react";
import AssignTaskPage from "./AssignTaskPage";
import TasksAssignedByMe from "@/components/milestone/TasksAssignedByMe";

const MentorIndividualAssignments = () => {
  const [view, setView] = useState<"assign" | "view">("assign");

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView("assign")}
          className={`rounded px-4 py-2 ${view === "assign" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
        >
          Assign Task
        </button>
        <button
          onClick={() => setView("view")}
          className={`rounded px-4 py-2 ${view === "view" ? "bg-primary text-white" : "bg-gray-200 text-gray-700"}`}
        >
          View Assigned
        </button>
      </div>

      {view === "assign" ? <AssignTaskPage /> : <TasksAssignedByMe />}
    </main>
  );
};

export default MentorIndividualAssignments;
