import { useMutation, useQuery } from "@tanstack/react-query";
import API from "../axiosInstance";
import { toast } from "react-hot-toast";

export const useCheckIn = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await API.post("/checkins/start");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Check-in started successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start check-in!");
    },
  });
};

export const useCheckOut = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await API.post("/checkins/stop");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Check-out completed successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to complete check-out!"
      );
    },
  });
};

export const useGetTotalHours = () => {
  return useQuery({
    queryKey: ["totalHours"],
    queryFn: async () => {
      const response = await API.get("/checkins/total");
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 2,
  });
};

export const useGetCheckInHistory = (username: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["checkInHistory", username, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const url = `/checkins/history/${username}${queryString ? `?${queryString}` : ''}`;
      
      const response = await API.get(url);
      return response?.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!username,
  });
};

export interface IAttendanceDay {
  checkInTime: string;
  checkOutTime?: string;
  hours: number | null;
}

export interface IUserWeeklyAttendance {
  userId: string;
  userName: string;
  userRole: string;
  days: Record<string, IAttendanceDay[]>;
}

export const useGetWeeklyAttendance = (weekStart?: string) => {
  return useQuery({
    queryKey: ["weeklyAttendance", weekStart],
    queryFn: async () => {
      const response = await API.get("/checkins/weekly-attendance", {
        params: weekStart ? { weekStart } : undefined,
      });
      return response?.data?.data as {
        weekStart: string;
        weekEnd: string;
        users: IUserWeeklyAttendance[];
      };
    },
    staleTime: 1000 * 60 * 2,
  });
};
