import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";
import type { ICategoryMark, IInternMarksSummary, MarkCategory } from "@/types/mark.type";

export const useGetMyInternsMarks = () => {
  return useQuery({
    queryKey: ["myInternsMarks"],
    queryFn: async () => {
      const response = await API.get("/marks/my-interns");
      return (response?.data?.data || []) as IInternMarksSummary[];
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useGetInternMarks = (internId?: string) => {
  return useQuery({
    queryKey: ["internMarks", internId],
    queryFn: async () => {
      const response = await API.get(`/marks/intern/${internId}`);
      return (response?.data?.data || []) as ICategoryMark[];
    },
    enabled: !!internId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpsertMark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { internId: string; category: MarkCategory; score: number }) => {
      const response = await API.post("/marks", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Mark saved");
      queryClient.invalidateQueries({ queryKey: ["myInternsMarks"] });
      queryClient.invalidateQueries({ queryKey: ["internMarks"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save mark");
    },
  });
};
