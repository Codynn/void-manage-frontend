
import { useQuery } from "@tanstack/react-query";
import API from "../axiosInstance";
import type { Notification } from "@/types/index.type";

const getNotifications = async (): Promise<Notification[]> => {
  const res = await API.get("/notifications");
  return res.data.data;
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchOnWindowFocus: true,
  });
};
