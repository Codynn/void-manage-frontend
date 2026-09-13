import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import API from "../axiosInstance";
import type { IDepartment, SystemRole } from "@/types/department.type";

export const useGetDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await API.get("/departments", { params: { limit: 100 } });
      return (response?.data?.data?.items || []) as IDepartment[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetDepartmentById = (id?: string) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: async () => {
      const response = await API.get(`/departments/${id}`);
      return response?.data?.data as IDepartment;
    },
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await API.post("/departments", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Department created successfully");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create department");
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; description?: string }) => {
      const response = await API.patch(`/departments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Department updated successfully");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update department");
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await API.delete(`/departments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Department archived");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to archive department");
    },
  });
};

export const useUpdateDepartmentRoleTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      departmentId,
      role,
      contractTemplate,
      phaseTemplate,
    }: {
      departmentId: string;
      role: SystemRole;
      contractTemplate?: string | null;
      phaseTemplate?: string | null;
    }) => {
      const response = await API.patch(`/departments/${departmentId}/role-template`, {
        role,
        contractTemplate,
        phaseTemplate,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(`${variables.role} template updated`);
      queryClient.invalidateQueries({ queryKey: ["department", variables.departmentId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update role template");
    },
  });
};
