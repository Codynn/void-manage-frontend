import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../axiosInstance";
import toast from "react-hot-toast";
import type {
  IProjectBase,
  TProjectForm,
  TTaskForm,
} from "@/types/project.type";

export const useGetProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await API.get("/projects");
      return response.data;
    },
  });
};

export const useGetProjectById = (projectId?: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await API.get(`/projects/${projectId}`);
      return response?.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectData: IProjectBase) => {
      const response = await API.post("/projects", projectData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Project created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create project!");
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      projectData,
    }: {
      projectId: string;
      projectData: TProjectForm;
    }) => {
      const response = await API.put(`/projects/${projectId}`, projectData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Project updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update project!");
    },
  });
};

// Task
export const  useCreateTask = () => {

  return useMutation({
    mutationFn: async (taskData: TTaskForm) => {
      const response = await API.post(`/tasks`, taskData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create task!");
    },
  });
};

export const useChangeTaskStatus = () => {
  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: string;
    }) => {
      const response = await API.put(`/tasks/${taskId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Task status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update task status!"
      );
    },
  });
};

export const useUpdateTask = () => {
  return useMutation({
    mutationFn: async ({
      taskId,
      taskData,
    }: {
      taskId: string;
      taskData: TTaskForm;
    }) => {
      const response = await API.put(`/tasks/${taskId}`, taskData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Task updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update task!");
    },
  });
};

export const useDeleteTask = () => {
  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await API.delete(`/tasks/${taskId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Task deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete task!");
    },
  });
};

export const useGetMyAssignedProject = () => {
  return useQuery({
    queryKey: ["myAssignedProjects"],
    queryFn: async () => {
      const response = await API.get("/projects/internprojects");
      return response.data;
    },
  });
};
