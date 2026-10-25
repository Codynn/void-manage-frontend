import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";
import type { ISpace, ISpaceAvailability, DayOfWeek } from "@/types/space.type";

// ---- Rooms (plain categorization label) ----

export const useGetRooms = (status?: string) => {
  return useQuery({
    queryKey: ["rooms", status],
    queryFn: async () => {
      const response = await API.get("/rooms", { params: { status, limit: 200 } });
      return response?.data?.data?.items || [];
    },
    staleTime: 1000 * 60,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code?: string; location?: string }) => {
      const response = await API.post("/rooms", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Room created");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to create room"),
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const response = await API.patch(`/rooms/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Room updated");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update room"),
  });
};

export const useArchiveRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/rooms/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Room archived");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to archive room"),
  });
};

// ---- Spaces (the actual bookable unit) ----

export const useGetSpaces = (status?: string) => {
  return useQuery({
    queryKey: ["spaces", status],
    queryFn: async () => {
      const response = await API.get("/spaces", { params: { status, limit: 200 } });
      return (response?.data?.data?.items || []) as ISpace[];
    },
    staleTime: 1000 * 60,
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; code?: string; location?: string; capacity?: number; room?: string | null }) => {
      const response = await API.post("/spaces", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Space created");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to create space"),
  });
};

export const useUpdateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const response = await API.patch(`/spaces/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Space updated");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update space"),
  });
};

export const useArchiveSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/spaces/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Space archived");
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to archive space"),
  });
};

export const useGetSpaceAvailability = (spaceId?: string, date?: string) => {
  return useQuery({
    queryKey: ["spaceAvailability", spaceId, date],
    queryFn: async () => {
      const response = await API.get(`/spaces/${spaceId}/availability`, { params: { date } });
      return response?.data?.data as ISpaceAvailability;
    },
    enabled: !!spaceId && !!date,
    staleTime: 1000 * 30,
  });
};

// ---- Allocations (bookings) ----

export const useCreateAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { space: string; date: string; startTime: string; endTime: string; purpose?: string }) => {
      const response = await API.post("/spaces/allocations", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking requested");
      queryClient.invalidateQueries({ queryKey: ["myAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["allAllocations"] });
      queryClient.invalidateQueries({ queryKey: ["spaceAvailability"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to request booking"),
  });
};

export const useGetMyAllocations = (status?: string) => {
  return useQuery({
    queryKey: ["myAllocations", status],
    queryFn: async () => {
      const response = await API.get("/spaces/allocations/mine", { params: { status, limit: 100 } });
      return response?.data?.data?.items || [];
    },
    staleTime: 1000 * 30,
  });
};

export const useGetAllAllocations = (filters: { status?: string; space?: string; date?: string } = {}) => {
  return useQuery({
    queryKey: ["allAllocations", filters],
    queryFn: async () => {
      const response = await API.get("/spaces/allocations/all", { params: { ...filters, limit: 100 } });
      return response?.data?.data?.items || [];
    },
    staleTime: 1000 * 20,
  });
};

const invalidateAllocations = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["myAllocations"] });
  queryClient.invalidateQueries({ queryKey: ["allAllocations"] });
  queryClient.invalidateQueries({ queryKey: ["spaceAvailability"] });
};

export const useUpdateAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const response = await API.patch(`/spaces/allocations/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking updated");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update booking"),
  });
};

export const useCancelAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await API.post(`/spaces/allocations/${id}/cancel`, { reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking cancelled");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to cancel booking"),
  });
};

export const useApproveAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.post(`/spaces/allocations/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking approved");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to approve booking"),
  });
};

export const useRejectAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await API.post(`/spaces/allocations/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking rejected");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to reject booking"),
  });
};

export const useOverrideAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await API.post(`/spaces/allocations/${id}/override`, { reason });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Booking overridden and approved");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to override booking"),
  });
};

export const useRestoreAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.post(`/spaces/allocations/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Restored previous entry");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to restore booking"),
  });
};

export const useSwapAllocations = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { allocationAId: string; allocationBId: string }) => {
      const response = await API.post("/spaces/allocations/swap", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Bookings swapped");
      invalidateAllocations(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to swap bookings"),
  });
};

// ---- Routines (constant timetable) ----

export const useGetRoutines = (filters: { space?: string; dayOfWeek?: DayOfWeek } = {}) => {
  return useQuery({
    queryKey: ["spaceRoutines", filters],
    queryFn: async () => {
      const response = await API.get("/spaces/routines", { params: filters });
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60,
  });
};

const invalidateRoutines = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["spaceRoutines"] });
  queryClient.invalidateQueries({ queryKey: ["spaceAvailability"] });
};

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      space: string;
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      title: string;
      batch?: string;
    }) => {
      const response = await API.post("/spaces/routines", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Routine added");
      invalidateRoutines(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to add routine"),
  });
};

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const response = await API.patch(`/spaces/routines/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Routine updated");
      invalidateRoutines(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update routine"),
  });
};

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/spaces/routines/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Routine deactivated");
      invalidateRoutines(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to deactivate routine"),
  });
};

export const useRelocateRoutineOccurrence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      date: string;
      status: "moved" | "cleared" | "swapped";
      relocatedSpace?: string;
      relocatedStartTime?: string;
      relocatedEndTime?: string;
      note?: string;
    }) => {
      const response = await API.post(`/spaces/routines/${id}/relocate`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Occurrence updated");
      invalidateRoutines(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to update occurrence"),
  });
};

export const useRestoreRoutineOccurrence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const response = await API.post(`/spaces/routines/${id}/restore`, { date });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Occurrence restored");
      invalidateRoutines(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to restore occurrence"),
  });
};

export const useImportRoutines = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await API.post("/spaces/routines/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateRoutines(queryClient);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to import routines"),
  });
};

// ---- Audit log ----

export const useGetSpaceAuditLog = (filters: { space?: string } = {}) => {
  return useQuery({
    queryKey: ["spaceAuditLog", filters],
    queryFn: async () => {
      const response = await API.get("/spaces/audit-log", { params: { ...filters, limit: 100 } });
      return response?.data?.data?.items || [];
    },
    staleTime: 1000 * 30,
  });
};
