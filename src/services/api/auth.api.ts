import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import API from "../axiosInstance";
import type { TLoginForm } from "@/types/index.type";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: TLoginForm) => {
      const response = await API.post("/users/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Login successful!");
      Cookies.set("accessToken", data.data.accessToken);
      switch (data?.data?.user?.role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "MENTOR":
          navigate("/mentor/dashboard");
          break;
        case "INTERN":
          navigate("/intern/dashboard");
          break;
        default:
          navigate("/");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed!");
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      const response = await API.post("/users/logout");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Logout successful!");
      Cookies.remove("accessToken");
      navigate("/auth/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Logout failed!");
    },
  });
};
