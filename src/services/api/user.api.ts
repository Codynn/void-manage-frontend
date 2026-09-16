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
      console.log("response in useGetUserData:", response);
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

export const useGetUsersByFilter = (filters: {
  department?: string;
  role?: string;
}) => {
  return useQuery({
    queryKey: ["users", "filtered", filters],
    queryFn: async () => {
      const response = await API.get("/users/allusers", {
        params: { all: true, limit: 1000, ...filters },
      });
      return response?.data?.data?.items || [];
    },
    enabled: !!filters.department,
    staleTime: 1000 * 60,
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
      role: string;
      department?: string;
      designation?: string;
      displayOrder?: number;
      contractTemplate?: string | null;
      phaseTemplate?: string | null;
      leavePolicy?: string | null;
    }) => {
      const response = await API.post("/users/createuser", userData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await API.post(`/users/${userId}/reset-password`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "Password reset - the user has been emailed their new temporary password",
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await API.post("/users/change-password", data);
      return response.data;
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    },
  });
};

export const useBulkCreateUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await API.post("/users/bulk-create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload users");
    },
  });
};
export const useCreateIntern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      username: string;
      password: string;
      role: string;
      department?: string;
      designation?: string;
      displayOrder?: number;
    }) => {
      // Hits the backend endpoint that sets adminId automatically
      const response = await API.post("/users/createintern", userData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch users list so new intern shows up
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

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: Partial<IUserData>) => {
      const response = await API.put(
        `/users/updateUser/${userData._id}`,
        userData,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success("User updated successfully");
      // Invalidate and refetch specific user data
      queryClient.invalidateQueries({ queryKey: ["user", variables._id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user");
    },
  });
};

export const useAddWelcomePhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (urls: string[]) => {
      const response = await API.post(`/users/welcome-photos`, { urls });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Welcome photos added successfully");
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to add welcome photos",
      );
    },
  });
};

export const useRemoveWelcomePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await API.delete(`/users/welcome-photos`, {
        data: { url },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Photo removed");
      queryClient.invalidateQueries({ queryKey: ["userData"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove photo");
    },
  });
};
