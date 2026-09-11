import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../axiosInstance";
import toast from "react-hot-toast";
import type { TLeaveRequestForm } from "@/types/leave.type";

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveData: TLeaveRequestForm) => {
      const response = await API.post("/leaves", leaveData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave request created successfully!");
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequestsPaginated"] });
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create leave request!"
      );
    },
  });
};

export const useUpdateLeaveStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leaveId,
      status,
      reviewComment,
    }: {
      leaveId: string;
      status: "APPROVED" | "REJECTED";
      reviewComment?: string;
    }) => {
      const response = await API.put(`/leaves/review/${leaveId}`, { status, reviewComment });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveStats"] });
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myLeaveRequestsPaginated"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update leave status!"
      );
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveId: string) => {
      const response = await API.delete(`/leaves/${leaveId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Leave request deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      queryClient.invalidateQueries({ queryKey: ["leaveStats"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete leave request!"
      );
    },
  });
};

export const useGetLeaveRequests = (filters: any) => {
  return useQuery({
    queryKey: ["leaveRequests", filters],
    queryFn: async () => {
      const response = await API.get("/leaves", { params: filters });
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export interface ILeaveStats {
  total: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
}

export const useGetLeaveStats = () => {
  return useQuery<ILeaveStats>({
    queryKey: ["leaveStats"],
    queryFn: async () => {
      const response = await API.get("/leaves/stats");
      return response?.data?.data || { total: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useGetMyLeaveRequests = () => {
  return useQuery({
    queryKey: ["myLeaveRequests"],
    queryFn: async () => {
      const response = await API.get("/leaves/mine");
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetMyLeaveRequestsPaginated = (pagination: { page: number; pageSize: number }) => {
  return useQuery({
    queryKey: ["myLeaveRequestsPaginated", pagination],
    queryFn: async () => {
      const response = await API.get("/leaves/mine", { params: pagination });
      return response?.data?.data || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};
