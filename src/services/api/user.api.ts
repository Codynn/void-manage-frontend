import Cookies from "js-cookie";
import API from "../axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { IUserData } from "@/types/user.type";
import toast from "react-hot-toast";

export const useGetUserData = () => {
  const token = Cookies.get("accessToken");
  return useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const response = await API.get("/users/currentUser");
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 2,
    enabled: !!token,
  });
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await API.get("/users/allusers?all=true&limit=1000");
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetUserById = (userId?: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await API.get(`/users/user/${userId}`);
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!userId,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      username: string;
      password: string;
      role: string;
    }) => {
      const response = await API.post("/users/register", userData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useAssignMentor = () => {
  return useMutation({
    mutationFn: async ({
      internUsername,
      mentorUsername,
    }: {
      internUsername: string;
      mentorUsername: string;
    }) => {
      const response = await API.post(`/users/assign-mentor`, {
        internUsername,
        mentorUsername,
      });
      return response.data;
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await API.delete(`/users/deleteUser/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUploadWelcomePhotos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, photos }: { userId: string; photos: string[] }) => {
      const response = await API.post(`/users/welcome-photos/${userId}`, {
        welcomePhotos: photos,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch specific user data
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<IUserData>) => {
      const response = await API.put(`/users/updateUser/${userData._id}`, userData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch specific user data
      queryClient.invalidateQueries({ queryKey: ["user", variables._id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateWelcomePhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, welcomePhotos }: { userId: string; welcomePhotos: string[] }) => {
      const response = await API.put(`/users/updateUser/${userId}`, {
        welcomePhotos,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Welcome photos updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
  });
};
