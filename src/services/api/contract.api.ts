import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../axiosInstance";
import type { TContractTemplateForm } from "@/types/contract.type";
import toast from "react-hot-toast";

export const useGetContractTemplates = () => {
  return useQuery({
    queryKey: ["contractTemplates"],
    queryFn: async () => {
      const response = await API.get("/contracts");
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetContractTemplateById = (id?: string) => {
  return useQuery({
    queryKey: ["contractTemplate", id],
    queryFn: async () => {
      const response = await API.get(`/contracts/${id}`);
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!id,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TContractTemplateForm) => {
      const response = await API.post("/contracts", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract created successfully");
      queryClient.invalidateQueries({
        queryKey: ["contractTemplates"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create contract"
      );
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TContractTemplateForm & { _id: string }) => {
      const response = await API.put(`/contracts/${data._id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["contractTemplates"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update contract"
      );
    },
  });
};

export const useGetAssignedContract = () => {
  return useQuery({
    queryKey: ["assignedContract"],
    queryFn: async () => {
      const response = await API.get("/contracts/assigned");
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetAssignedContractsByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["assignedContract", userId],
    queryFn: async () => {
      const response = await API.get(`/contracts/assigned/${userId}`);
      return response?.data?.data || {};
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useSignContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      instanceId: string;
      signatureFileId: string;
      agreedToTerms: boolean;
    }) => {
      const response = await API.post(
        `/contracts/instance/${data.instanceId}`,
        {
          signatureFileId: data.signatureFileId,
          agreedToTerms: data.agreedToTerms,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract signed successfully");
      queryClient.invalidateQueries({
        queryKey: ["assignedContract"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to sign contract"
      );
    },
  });
};

export const useApproveContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const response = await API.post(`/contracts/instance/${instanceId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract approved successfully");
      queryClient.invalidateQueries({
        queryKey: ["assignedContract"],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve contract");
    },
  });
};

export const useUpdateContractInstanceContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      instanceId,
      content,
      layout,
    }: {
      instanceId: string;
      content?: any;
      layout?: any;
    }) => {
      const response = await API.patch(`/contracts/instance/${instanceId}/content`, {
        content,
        layout,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract content updated");
      queryClient.invalidateQueries({ queryKey: ["assignedContract"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update contract content");
    },
  });
};

export const useRejectContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, message }: { instanceId: string; message: string }) => {
      const response = await API.post(`/contracts/instance/${instanceId}/reject`, { message });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract rejected");
      queryClient.invalidateQueries({
        queryKey: ["assignedContract"],
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject contract");
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/contracts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["contractTemplates"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete contract"
      );
    },
  });
};

export const useCreateAssignContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      contractId: string;
      assignedTo: string;
      placeholderValues?: Record<string, string>;
    }) => {
      const response = await API.post("/contracts/assignContract", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Contract assigned successfully");
      queryClient.invalidateQueries({
        queryKey: ["userContract"],
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to assign contract"
      );
    },
  });
}