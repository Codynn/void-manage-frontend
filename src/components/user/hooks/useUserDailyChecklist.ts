import { useQueryClient } from "@tanstack/react-query";
import { useUserChecklist, useUpdateTaskStatus } from "@/services/api/checklist.api";
import type { DailyChecklistTask } from "../../../types/task.type";

export const useUserDailyChecklist = (userId?: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading: isFetching } = useUserChecklist(userId);
  const updateMutation = useUpdateTaskStatus();

  const toggleTask = async (taskId: string, completed: boolean) => {
    await updateMutation.mutateAsync({ taskId, completed: !completed });

    queryClient.invalidateQueries({
      queryKey: ["user-checklist", userId],
    });
  };

  return {
    tasks: (data as DailyChecklistTask[]) ?? [],
    isLoading: isFetching,
    toggleTask,
    isSaving: updateMutation.isPending,
  };
};