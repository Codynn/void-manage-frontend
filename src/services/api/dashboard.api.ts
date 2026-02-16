import { useQuery } from "@tanstack/react-query";
import API from "../axiosInstance";

export const useGetDashboardData = () => {
  return useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const response = await API.get("/stats/dashboardData");
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useUserDashboard = () => {
  return useQuery({
    queryKey: ["userDashboard"],
    queryFn: async () => {
      const response = await API.get("/users/dashboard");
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};
