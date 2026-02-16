import type { TLinkFormValues } from "@/types/links.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../axiosInstance";
import toast from "react-hot-toast";

export const useCreateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TLinkFormValues) => {
      const response = await API.post("/links", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Link created successfully!");
      queryClient.invalidateQueries({
        queryKey: ["my-links"],
      });
    },
    onError: () => {
      toast.error("Failed to create link");
    },
  });
};

export const useGetLinks = () => {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const response = await API.get("/links");
      return response?.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetVisibleLinks = () => {
  return useQuery({
    queryKey: ["visible-links"],
    queryFn: async () => {
      const response = await API.get("/links/visible");
      return response?.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useGetMyLinks = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["my-links", page, pageSize],
    queryFn: async () => {
      const response = await API.get(`/links/myCreatedLinks?page=${page}&pageSize=${pageSize}`);
      return response?.data?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};

export const useUpdateLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TLinkFormValues }) => {
      const response = await API.put(`/links/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Link updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["my-links"],
      });
    },
    onError: () => {
      toast.error("Failed to update link");
    },
  });
};

export const useDeleteLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/links/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Link deleted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["my-links"],
      });
    },
    onError: () => {
      toast.error("Failed to delete link");
    },
  });
};


export const useGetLinksByInternId = (internId: string) => {
  return useQuery({
    queryKey: ["links", "intern", internId],
    queryFn: async () => {
      const response = await API.get(`/links?userId=${internId}`);
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    enabled: !!internId,
  });
}