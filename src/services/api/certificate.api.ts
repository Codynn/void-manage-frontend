import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";
import type { CertificateType, TCertificateTemplateForm } from "@/types/certificate.type";

export const useGetCertificateTemplates = (type?: CertificateType) => {
  return useQuery({
    queryKey: ["certificateTemplates", type],
    queryFn: async () => {
      const response = await API.get("/certificates/templates", { params: { type } });
      return response?.data?.data || {};
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useGetCertificateTemplateById = (id?: string) => {
  return useQuery({
    queryKey: ["certificateTemplate", id],
    queryFn: async () => {
      const response = await API.get(`/certificates/templates/${id}`);
      return response?.data?.data || {};
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useCreateCertificateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TCertificateTemplateForm) => {
      const response = await API.post("/certificates/templates", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Certificate template created successfully");
      queryClient.invalidateQueries({ queryKey: ["certificateTemplates"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create certificate template");
    },
  });
};

export const useUpdateCertificateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TCertificateTemplateForm & { _id: string }) => {
      const response = await API.put(`/certificates/templates/${data._id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Certificate template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["certificateTemplates"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update certificate template");
    },
  });
};

export const useDeleteCertificateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/certificates/templates/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Certificate template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["certificateTemplates"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete certificate template");
    },
  });
};

export const useIssueCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      templateId: string;
      assignedTo: string;
      placeholderValues?: Record<string, string>;
    }) => {
      const response = await API.post("/certificates/issue", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Certificate issued successfully");
      queryClient.invalidateQueries({ queryKey: ["assignedCertificates"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to issue certificate");
    },
  });
};

export const useGetMyCertificates = () => {
  return useQuery({
    queryKey: ["assignedCertificates"],
    queryFn: async () => {
      const response = await API.get("/certificates/assigned");
      return response?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useGetCertificatesByUserId = (userId?: string) => {
  return useQuery({
    queryKey: ["assignedCertificates", userId],
    queryFn: async () => {
      const response = await API.get(`/certificates/assigned/${userId}`);
      return response?.data?.data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useRevokeCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const response = await API.delete(`/certificates/${instanceId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Certificate revoked");
      queryClient.invalidateQueries({ queryKey: ["assignedCertificates"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to revoke certificate");
    },
  });
};
