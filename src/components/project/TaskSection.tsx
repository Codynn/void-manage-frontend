import { useState } from "react";
import { TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { useDeleteTask } from "@/services/api/project.api";
import { useQueryClient } from "@tanstack/react-query";
import type { IUserData } from "@/types/user.type";
import type { ITaskBase } from "@/types/project.type";

interface TaskSectionProps {
  projectId: string;
  tasks: any[];
  assignedUsers: IUserData[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  getStatusColor: (status: string) => string;
}

export const TaskSection = ({ 
  projectId, 
  tasks, 
  assignedUsers, 
  onStatusChange, 
  getStatusColor,
}: TaskSectionProps) => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITaskBase | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleEditTask = (task: ITaskBase) => {
    setEditingTask(task);
    setDialogMode('edit');
    setIsTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["project", projectId],
          });
          setDeleteDialogOpen(false);
          setTaskToDelete(null);
        },
      });
    }
  };

  const handleDialogClose = () => {
    setIsTaskDialogOpen(false);
    setEditingTask(null);
    setDialogMode('create');
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setDialogMode('create');
    setIsTaskDialogOpen(true);
  };


  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
            </div>
            <Button onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <TaskList
            tasks={tasks}
            onStatusChange={onStatusChange}
            getStatusColor={getStatusColor}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </Card>

      {/* Task Form Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'edit' ? 'Edit Task' : 'Create New Task'}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            projectId={projectId}
            assignedUsers={assignedUsers}
            onCancel={handleDialogClose}
            editTask={editingTask || undefined}
            mode={dialogMode}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
