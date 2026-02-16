import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, UserPlus, ListTodo, UserCheck } from "lucide-react";
import {
  useGetAllTasksPaginated,
  useDeleteTask,
  useTasksAssignedByMe,
  useDeleteIndividualTask
} from "@/services/api/checklist.api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const DailyChecklistPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tasksData, isLoading: isLoadingTasks, refetch: refetchTasks } = useGetAllTasksPaginated();
  const { data: assignedTasksData, isLoading: isLoadingAssigned, refetch: refetchAssigned } = useTasksAssignedByMe();

  const { mutate: deleteTaskMutate, isPending: isDeletingRole } = useDeleteTask();
  const { mutate: deleteIndividualTaskMutate, isPending: isDeletingIndividual } = useDeleteIndividualTask();

  const roleTasks = tasksData?.items || [];
  const assignedTasks = assignedTasksData?.items || [];

  const filteredRoleTasks = roleTasks.filter((task: any) =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAssignedTasks = assignedTasks.filter((task: any) =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRoleTask = (taskId: string, taskName: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskName}"?`)) {
      deleteTaskMutate(taskId, {
        onSuccess: () => {
          toast.success("Task deleted!");
          refetchTasks();
        },
      });
    }
  };

  const handleDeleteIndividualTask = (taskId: string, taskName: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskName}"?`)) {
      deleteIndividualTaskMutate(taskId, {
        onSuccess: () => {
          toast.success("Task deleted!");
          refetchAssigned();
        },
      });
    }
  };

  const isLoading = isLoadingTasks || isLoadingAssigned;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Checklist Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/admin/milestones/assign-task")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assign to Individuals
          </Button>
          <Button
            onClick={() => navigate("/admin/milestones/create-task")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      <Input
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="max-w-md bg-background"
      />

      {/* Daily Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Daily Tasks (Role-Based)</h3>
          <span className="text-sm text-muted-foreground">
            ({filteredRoleTasks.length})
          </span>
        </div>

        {filteredRoleTasks.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-gray-600">No daily tasks found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoleTasks.map((task: any) => (
              <Card key={task._id} className="transition-shadow duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{task.name}</CardTitle>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {task.role?.toUpperCase()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {task.description && <p className="text-sm text-gray-600">{task.description}</p>}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={task.mandatory ? "text-red-600" : "text-gray-500"}>
                      {task.mandatory ? "Required" : "Optional"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/milestones/edit-task/${task._id}`)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteRoleTask(task._id, task.name)}
                      disabled={isDeletingRole}
                      className="flex items-center gap-1 text-destructive hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Individually Assigned Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          <h3 className="text-xl font-semibold">Individually Assigned Tasks</h3>
          <span className="text-sm text-muted-foreground">
            ({filteredAssignedTasks.length})
          </span>
        </div>

        {filteredAssignedTasks.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-gray-600">No individually assigned tasks found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAssignedTasks.map((task: any) => (
              <Card key={task._id} className="border-green-200 transition-shadow duration-200 hover:shadow-md dark:border-green-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{task.name}</CardTitle>
                    <span
                      className={`text-sm font-medium ${
                        task.completed ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {task.completed ? "✓ Done" : "Pending"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {task.description && <p className="text-sm text-gray-600">{task.description}</p>}

                  <div className="space-y-1 text-xs text-muted-foreground">
                    {task.assignedTo && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        <span>Assigned to: {task.assignedTo.username}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <span className={task.mandatory ? "text-red-600" : "text-gray-500"}>
                      {task.mandatory ? "Required" : "Optional"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/admin/milestones/edit-assigned-task/${task._id}`)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteIndividualTask(task._id, task.name)}
                      disabled={isDeletingIndividual}
                      className="flex items-center gap-1 text-destructive hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChecklistPage;