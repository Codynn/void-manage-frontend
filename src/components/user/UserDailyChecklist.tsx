import React from "react";
import { useUserDailyChecklist } from "../user/hooks/useUserDailyChecklist";
import { Check, Circle } from "lucide-react";
import type { DailyChecklistTask } from "../../types/task.type";

interface UserDailyChecklistProps {
  userId?: string; // Optional: if provided, fetch that user's checklist
}

export const UserDailyChecklist: React.FC<UserDailyChecklistProps> = ({ userId }) => {
  const { tasks, isLoading, toggleTask, isSaving } = useUserDailyChecklist(userId);

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold">Today's Checklist</h2>
        <p>Loading checklist...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
        <h2 className="text-xl font-semibold">Today's Checklist</h2>
        <p>No tasks for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="text-xl font-semibold">Today's Checklist</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task: DailyChecklistTask) => (
          <div
            key={task._id}
            className={`
              flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors duration-200
              ${task.completed ? "bg-green-100 dark:bg-green-900" : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"}
              ${isSaving ? "pointer-events-none opacity-50" : ""}
            `}
            onClick={() => toggleTask(task._id, task.completed)}
          >
            <div className="flex flex-col space-y-1">
              <h3 className="font-medium">{task.name}</h3>
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-300">{task.description}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-400">
                {task.mandatory ? "Mandatory" : "Optional"}
              </p>
            </div>

            <div>
              {task.completed ? (
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <Circle className="h-6 w-6 text-gray-400 dark:text-gray-300" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};