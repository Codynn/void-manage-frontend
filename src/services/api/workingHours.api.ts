import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API from "../axiosInstance";
import toast from "react-hot-toast";

const handleError = (error: any) => {
  console.error("API Error:", error.response?.data);
  toast.error(error?.response?.data?.message || "Something went wrong");
};

export const useSubmitWorkingHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { dayOfWeek: string; shifts: { startTime: string; endTime: string }[] }) =>
      (await API.post("/working-hours/request", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-working-hours"] });
      toast.success("Working hours submitted successfully!");
    },
    onError: handleError,
  });
};

interface WorkingHourRequest {
  _id: string;
  user: string;
  role: string;
  dayOfWeek: string;
  shifts: { startTime: string; endTime: string }[];
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminComment?: string;
}

export const useGetWorkingHoursRequests = () =>
  useQuery<WorkingHourRequest[], Error>({
    queryKey: ["working-hours-requests"],
    queryFn: async () => (await API.get("/working-hours/requests")).data.data,
    staleTime: 1000 * 60 * 2,
  });

export const useApproveWorkingHoursRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await API.put(`/working-hours/requests/${id}/approve`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours-requests"] });
      toast.success("Request approved");
    },
    onError: handleError,
  });
};

export const useRejectWorkingHoursRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) =>
      (await API.put(`/working-hours/requests/${id}/reject`, { adminComment: comment })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours-requests"] });
      toast.success("Request rejected");
    },
    onError: handleError,
  });
};

interface UserWorkingHours {
  userId: string;
  userName: string;
  userRole: string;
  schedule: {
    [key: string]: { startTime: string; endTime: string }[];
  };
}

export const useGetAllUsersWorkingHours = () =>
  useQuery<UserWorkingHours[], Error>({
    queryKey: ["all-users-working-hours"],
    queryFn: async () => (await API.get("/working-hours/all")).data.data,
    staleTime: 1000 * 60 * 5,
  });