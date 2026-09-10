import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";

export interface IFileRecord {
  _id: string;
  originalName: string;
  storedFilename: string;
  url: string;
  mimeType?: string;
  size?: number;
  uploadedBy?: { _id: string; name?: string; email?: string; role?: string } | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: { _id: string; name?: string; email?: string; role?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const useGetAllFiles = () => {
  return useQuery<IFileRecord[]>({
    queryKey: ["files", "all"],
    queryFn: async () => {
      const response = await API.get("/files/all");
      return response.data.data;
    },
  });
};

export const useGetDeletedFiles = () => {
  return useQuery<IFileRecord[]>({
    queryKey: ["files", "deleted"],
    queryFn: async () => {
      const response = await API.get("/files/deleted");
      return response.data.data;
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await API.post("/files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data as IFileRecord;
    },
    onSuccess: () => {
      toast.success("File uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload file!");
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await API.delete(`/files/${fileId}`);
      return response.data.data as IFileRecord;
    },
    onSuccess: () => {
      toast.success("File deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete file!");
    },
  });
};
