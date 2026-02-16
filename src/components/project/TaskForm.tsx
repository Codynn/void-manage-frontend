import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DatePicker,
  formatDateToString,
  parseDateString,
} from "@/components/ui/date-picker";
import type { TTaskForm, ITaskBase } from "@/types/project.type";
import type { IUserData } from "@/types/user.type";
import { useCreateTask, useUpdateTask } from "@/services/api/project.api";
import { useQueryClient } from "@tanstack/react-query";

interface TaskFormProps {
  projectId: string;
  assignedUsers: IUserData[];
  onCancel: () => void;
  editTask?: ITaskBase;
  mode?: 'create' | 'edit';
}

export const TaskForm = ({
  projectId,
  assignedUsers,
  onCancel,
  editTask,
  mode = 'create',
}: TaskFormProps) => {
  const queryClient = useQueryClient();
  const isEditMode = mode === 'edit' && editTask;

  // Helper function to get user ID from assignedTo field
  const getAssignedUserId = (assignedTo: string | IUserData): string => {
    if (typeof assignedTo === 'string') {
      return assignedTo;
    }
    return assignedTo._id;
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TTaskForm>({
    defaultValues: {
      title: "",
      status: "pending",
      project: projectId,
      assignedTo: "",
      timeline: {
        start: "",
        end: "",
      },
    },
  });

  // Reset form values when editTask changes
  useEffect(() => {
    if (isEditMode && editTask) {
      reset({
        title: editTask.title,
        status: editTask.status,
        project: projectId,
        assignedTo: getAssignedUserId(editTask.assignedTo),
        timeline: {
          start: editTask.timeline?.start || "",
          end: editTask.timeline?.end || "",
        },
      });
    } else {
      reset({
        title: "",
        status: "pending",
        project: projectId,
        assignedTo: "",
        timeline: {
          start: "",
          end: "",
        },
      });
    }
  }, [editTask, isEditMode, projectId, reset]);

  // API CALLS
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const onSubmit = (data: TTaskForm) => {
    if (isEditMode) {
      updateTask({ taskId: editTask._id, taskData: data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["project", projectId],
          });
          onCancel();
        },
      });
    } else {
      createTask(data, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["project", projectId],
          });
          onCancel();
        },
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="taskTitle" className="text-sm font-medium">
          Task Title <span className="text-destructive">*</span>
        </label>
        <Input
          id="taskTitle"
          placeholder="Enter task title"
          {...register("title", { required: "Task title is required" })}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Assign To <span className="text-destructive">*</span>
          </label>
          <Controller
            name="assignedTo"
            control={control}
            rules={{ required: "Please assign the task to someone" }}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(value)} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {assignedUsers.map((user: IUserData) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.assignedTo && (
            <p className="text-sm text-destructive">
              {errors.assignedTo.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Controller
            name="timeline.start"
            control={control}
            render={({ field }) => {
              const parsedDate = field.value && field.value.trim() !== '' ? parseDateString(field.value) : undefined;
              return (
                <DatePicker
                  date={parsedDate}
                  onDateChange={(date) =>
                    field.onChange(date ? formatDateToString(date) : "")
                  }
                  placeholder="Select start date"
                />
              );
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <Controller
            name="timeline.end"
            control={control}
            render={({ field }) => {
              const parsedDate = field.value && field.value.trim() !== '' ? parseDateString(field.value) : undefined;
              return (
                <DatePicker
                  date={parsedDate}
                  onDateChange={(date) =>
                    field.onChange(date ? formatDateToString(date) : "")
                  }
                  placeholder="Select end date"
                />
              );
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Task" : "Create Task")}
        </Button>
      </div>
    </form>
  );
};
