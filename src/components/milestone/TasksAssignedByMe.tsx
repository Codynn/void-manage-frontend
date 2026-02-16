import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  useTasksAssignedByMe,
  useDeleteIndividualTask,
  useUpdateIndividualTask,
  useUpdateIndividualTaskStatus,
} from "@/services/api/checklist.api";

// Task and User types
interface User {
  username: string;
}

interface Task {
  _id: string;
  name: string;
  description?: string;
  dueDate?: string | null;
  completed: boolean;
  assignedTo?: User;
  createdAt?: string;
}

const TasksAssignedByMe = () => {
  // Pagination, search, and sorting state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "createdAt" | "name">("dueDate");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  // Editing state for tasks
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // API hooks for fetching and mutating tasks
  const { data, isLoading, refetch } = useTasksAssignedByMe(page, 10, search, sortBy, order);
  const deleteTaskMutation = useDeleteIndividualTask();
  const updateTaskMutation = useUpdateIndividualTask();
  const updateStatusMutation = useUpdateIndividualTaskStatus();

  // Group tasks by assignee and sort them
  const groupedTasks = useMemo(() => {
    const tasks: Task[] = data?.items || [];
    const group: Record<string, Task[]> = {};

    tasks.forEach(task => {
      const assignee = task.assignedTo?.username || "Unknown";
      if (!group[assignee]) group[assignee] = [];
      group[assignee].push(task);
    });

    Object.keys(group).forEach(assignee => {
      group[assignee].sort((a, b) => {
        let aVal: any = a[sortBy];
        let bVal: any = b[sortBy];

        if (sortBy === "dueDate" || sortBy === "createdAt") {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = (bVal || "").toLowerCase();
        }

        if (typeof aVal === "string")
          return order === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        return order === "asc" ? aVal - bVal : bVal - aVal;
      });
    });

    return group;
  }, [data?.items, sortBy, order]);

  // Delete a task
  const handleDelete = (taskId: string) => {
    deleteTaskMutation.mutate(taskId, { onSuccess: () => refetch() });
  };

  // Toggle sorting order
  const toggleOrder = () => setOrder(order === "asc" ? "desc" : "asc");

  // Start editing a task
  const startEdit = (task: Task) => {
    setEditingTask(task);
    setEditName(task.name);
    setEditDescription(task.description || "");
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
  };

  // Save edited task
  const saveEdit = () => {
    if (!editingTask) return;

    updateTaskMutation.mutate(
      {
        taskId: editingTask._id,
        name: editName,
        description: editDescription,
        dueDate: editDueDate || undefined,
      },
      {
        onSuccess: () => {
          setEditingTask(null);
          refetch();
        },
      }
    );
  };

  // Toggle task completion status
  const toggleStatus = (task: Task) => {
    updateStatusMutation.mutate(
      { taskId: task._id, completed: !task.completed },
      { onSuccess: () => refetch() }
    );
  };

  return (
    <div className="space-y-6">
      {isLoading && <p>Loading tasks...</p>}

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by assignee..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full rounded border border-gray-300 p-2"
      />

      {/* Sorting controls */}
      <div className="mb-4 flex gap-2">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as "dueDate" | "createdAt" | "name")}
          className="rounded border p-2"
        >
          <option value="dueDate">Due Date</option>
          <option value="createdAt">Created At</option>
          <option value="name">Task Name</option>
        </select>
        <Button onClick={toggleOrder}>{order === "asc" ? "Asc" : "Desc"}</Button>
      </div>

      {/* Task list grouped by assignee */}
      {Object.keys(groupedTasks).length === 0
        ? !isLoading && <p>No matching tasks found.</p>
        : Object.entries(groupedTasks).map(([assignee, tasksForUser]) => (
            <div key={assignee}>
              <h2 className="mb-2 text-lg font-semibold">{assignee}</h2>
              <div className="space-y-4">
                {tasksForUser.map(task => (
                  <div
                    key={task._id}
                    className="flex flex-col items-start justify-between gap-2 rounded border border-gray-300 bg-white p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1">
                      {editingTask?._id === task._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="w-full rounded border p-1"
                          />
                          <textarea
                            value={editDescription}
                            onChange={e => setEditDescription(e.target.value)}
                            className="w-full rounded border p-1"
                          />
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={e => setEditDueDate(e.target.value)}
                            className="w-full rounded border p-1"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium">{task.name}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-500">{task.description}</p>
                          )}
                        </>
                      )}
                      <p className="text-xs text-gray-400">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"} |{" "}
                        Status:{" "}
                        <span className={task.completed ? "text-green-600" : "text-red-600"}>
                          {task.completed ? "Completed" : "Pending"}
                        </span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {editingTask?._id === task._id ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={saveEdit}
                            disabled={updateTaskMutation.status === "pending"}
                          >
                            Save
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setEditingTask(null)}
                            disabled={updateTaskMutation.status === "pending"}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => startEdit(task)}
                            disabled={updateTaskMutation.status === "pending"}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => toggleStatus(task)}
                            disabled={updateStatusMutation.status === "pending"}
                          >
                            {task.completed ? "Mark Pending" : "Mark Completed"}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(task._id)}
                            disabled={deleteTaskMutation.status === "pending"}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

      {/* Pagination controls */}
      {data?.totalPages && data.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {data.totalPages}
          </span>
          <Button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TasksAssignedByMe;
