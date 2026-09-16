import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";
import type { ILeavePolicy, TLeavePolicyForm } from "@/types/leavePolicy.type";

export const useGetLeavePolicies = () => {
  return useQuery({
    queryKey: ["leavePolicies"],
    queryFn: async () => {
      const response = await API.get("/leave-policies");
      return (response?.data?.data || []) as ILeavePolicy[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetLeavePolicyById = (id?: string) => {
  return useQuery({
    queryKey: ["leavePolicy", id],
    queryFn: async () => {
      const response = await API.get(`/leave-policies/${id}`);
      return response?.data?.data as ILeavePolicy;
    },
    enabled: !!id,
  });
};

export const useCreateLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TLeavePolicyForm) => {
      const response = await API.post("/leave-policies", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave policy created");
      queryClient.invalidateQueries({ queryKey: ["leavePolicies"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create leave policy");
    },
  });
};

export const useUpdateLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: TLeavePolicyForm & { id: string }) => {
      const response = await API.patch(`/leave-policies/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave policy updated");
      queryClient.invalidateQueries({ queryKey: ["leavePolicies"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update leave policy");
    },
  });
};

export const useDeleteLeavePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/leave-policies/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave policy deleted");
      queryClient.invalidateQueries({ queryKey: ["leavePolicies"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete leave policy");
    },
  });
};
