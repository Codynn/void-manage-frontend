import { useMutation, useQuery } from "@tanstack/react-query";
import API from "../axiosInstance";
import toast from "react-hot-toast";

// Phase API

export const useCreatePhase = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await API.post("/phases", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create phase");
    },
  });
};

export const useGetPhases = () => {
  return useQuery({
    queryKey: ["phases"],
    queryFn: async () => {
      const response = await API.get("/phases");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetPhaseById = (phaseId: string) => {
  return useQuery({
    queryKey: ["phase", phaseId],
    queryFn: async () => {
      const response = await API.get(`/phases/${phaseId}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!phaseId,
  });
};

export const useGetPhasesByInternId = (internId: string) => {
  return useQuery({
    queryKey: ["phases", "intern", internId],
    queryFn: async () => {
      const response = await API.get(`/phases?userId=${internId}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!internId,
  });
}

export const useDeletePhase = () => {
  return useMutation({
    mutationFn: async (phaseId: string) => {
      const response = await API.delete(`/phases/${phaseId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete phase");
    },
  });
};

export const useCreateCheckpoint = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await API.post("/checkpoints", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Checkpoint created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create checkpoint"
      );
    },
  });
};

export const useGetCheckpointById = (checkpointId: string) => {
  return useQuery({
    queryKey: ["checkpoint", checkpointId],
    queryFn: async () => {
      const response = await API.get(`/checkpoints/${checkpointId}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!checkpointId,
  });
};

export const useDeleteCheckpoint = () => {
  return useMutation({
    mutationFn: async (checkpointId: string) => {
      const response = await API.delete(`/checkpoints/${checkpointId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Checkpoint deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete checkpoint"
      );
    },
  });
};

export const useCreatePhaseTemplate = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await API.post("/phasestemp", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase template created successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create phase template"
      );
    },
  });
};

export const useGetPhaseTemplates = () => {
  return useQuery({
    queryKey: ["phase-templates"],
    queryFn: async () => {
      const response = await API.get("/phasestemp");
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetPhaseTemplateById = (templateId: string) => {
  return useQuery({
    queryKey: ["phase-template", templateId],
    queryFn: async () => {
      const response = await API.get(`/phasestemp/${templateId}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!templateId,
  });
};

export const useUpdatePhaseTemplate = () => {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await API.put(`/phasestemp/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase template updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update phase template"
      );
    },
  });
};

export const useUpdatePhaseCompletion = () => {
  return useMutation({
    mutationFn: async (data: { phaseId: string; isCompleted: boolean }) => {
      const response = await API.put(`/phases/${data.phaseId}`, {
        status: data.isCompleted ? "approved" : "in-progress",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase completion status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update phase completion"
      );
    },
  });
};

export const useUpdateCheckpointCompletion = () => {
  return useMutation({
    mutationFn: async (data: { 
      phaseId: string; 
      checkpointIndex: number; 
      isCompleted: boolean 
    }) => {
      const response = await API.patch(`/phases/${data.phaseId}/checkpoints/${data.checkpointIndex}/completion`, {
        isCompleted: data.isCompleted,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Checkpoint completion status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update checkpoint completion"
      );
    },
  });
};

export const useDeletePhaseTemplate = () => {
  return useMutation({
    mutationFn: async (templateId: string) => {
      const response = await API.delete(`/phasestemp/${templateId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase template deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete phase template"
      );
    },
  });
};


export const useAssignPhaseTemplate = () => {
  return useMutation({
    mutationFn: async ({ userId, templateId }: { userId: string; templateId: string }) => {
      const response = await API.post(`/phasestemp/assign/${userId}`, { templateId });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phase template assigned successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to assign phase template"
      );
    },
  });
}

export const useUpdatePhase = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await API.put("/phases/" + data._id, data);
      return response.data;
    }
  })
}