import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";

export const useUploadPhoto = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await API.post("/photo/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Photo uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload photo!");
    },
  });
};
