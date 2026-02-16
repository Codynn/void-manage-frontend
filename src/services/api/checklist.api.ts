import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../axiosInstance";
import toast from "react-hot-toast";

const handleError = (error: any) => {
  toast.error(error?.response?.data?.message || "Something went wrong");
};

// Fetch user checklist (role + individual tasks)
export const useUserChecklist = (userId?: string) => {
  return useQuery({
    queryKey: ["user-checklist", userId],
    queryFn: async () => {
      // If userId provided, fetch specific user's checklist
      // Otherwise fetch own checklist
      const endpoint = userId ? `/checklist/user/${userId}` : `/checklist`;

      const response = await API.get(endpoint);

      // Extract and combine both task types
      const { roleBased = [], individual = [] } = response.data?.data || {};

      return [...roleBased, ...individual];
    },
    enabled: true,
    staleTime: 1000 * 60 * 2,
  });
};

// Update status for role-based task
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      (await API.patch(`/checklist/${taskId}/status`, { completed })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-checklist"] });
      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

// Update status for individual task
export const useUpdateIndividualTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      (await API.patch(`/checklist/individual/${taskId}/status`, { completed })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-checklist"] });
      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

// Fetch individually assigned tasks
export const useIndividuallyAssignedTasks = () =>
  useQuery({
    queryKey: ["individual-tasks"],
    queryFn: async () => (await API.get("/checklist/individual/my-tasks")).data?.data,
    staleTime: 1000 * 60 * 2,
  });

// Get a task by ID
export const useGetTaskById = (taskId: string) =>
  useQuery({
    queryKey: ["checklist-task", taskId],
    queryFn: async () => {
      if (!taskId) throw new Error("Task ID is required");
      return (await API.get(`/checklist/${taskId}`)).data?.data;
    },
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

// Get all tasks paginated
export const useGetAllTasksPaginated = (page = 1, limit = 10, role?: string) =>
  useQuery({
    queryKey: ["all-checklist-tasks", page, limit, role],
    queryFn: async () => {
      const query = role
        ? `?page=${page}&limit=${limit}&role=${role}`
        : `?page=${page}&limit=${limit}`;
      return (await API.get(`/checklist/all${query}`)).data?.data;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

// Create master task
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      role: string;
      mandatory?: boolean;
      description?: string;
    }) => (await API.post("/checklist", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-checklist-tasks"] });
      toast.success("Checklist task created successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

// Update master task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      name?: string;
      mandatory?: boolean;
      description?: string;
      role?: string;
    }) => (await API.patch(`/checklist/${data.taskId}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-checklist-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["checklist-task"] });
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

// Delete master task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => (await API.delete(`/checklist/${taskId}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-checklist-tasks"] });
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

// Assignable users
export const useAssignableInterns = () =>
  useQuery({
    queryKey: ["assignable-interns"],
    queryFn: async () => (await API.get("/checklist/assignable/interns")).data?.data,
    staleTime: 1000 * 60 * 5,
  });

export const useAssignableMentors = () =>
  useQuery({
    queryKey: ["assignable-mentors"],
    queryFn: async () => (await API.get("/checklist/assignable/mentors")).data?.data,
    staleTime: 1000 * 60 * 5,
  });

// Assign task
export const useAssignTaskToIntern = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      internId: string;
      name: string;
      description?: string;
      mandatory?: boolean;
      dueDate?: string;
    }) => (await API.post("/checklist/assign/intern", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-by-me"] });
      toast.success("Task assigned to intern successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

export const useAssignTaskToMentor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      mentorId: string;
      name: string;
      description?: string;
      mandatory?: boolean;
      dueDate?: string;
    }) => (await API.post("/checklist/assign/mentor", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-by-me"] });
      toast.success("Task assigned to mentor successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};

// Tasks assigned by current user
export const useTasksAssignedByMe = (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc"
) =>
  useQuery({
    queryKey: ["assigned-by-me", page, limit, search, sortBy, order],
    queryFn: async () => {
      const query = `?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&order=${order}`;
      return (await API.get(`/checklist/assigned-by-me${query}`)).data?.data;
    },
    staleTime: 1000 * 60 * 2,
  });

export const useDeleteIndividualTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await API.delete(`/checklist/individual/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-by-me"] });
      queryClient.invalidateQueries({ queryKey: ["user-checklist"] });
      toast.success("Individual task deleted successfully!");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to delete task";
      if (err?.response?.status === 404) {
        toast.error("You can't delete this task because you didn't create it!");
      } else {
        toast.error(message);
      }
      console.error(`Failed to delete task:`, err);
    },
  });
};

// Update individual task
export const useUpdateIndividualTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      name?: string;
      description?: string;
      dueDate?: string;
    }) => (await API.patch(`/checklist/individual/${data.taskId}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-by-me"] });
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => handleError(error),
  });
};