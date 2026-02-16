import { useGetUserData } from "@/services/api/user.api";
import { LoaderCircle } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const AdminWrapper = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading: userLoading, error: userError } = useGetUserData();

  // Loading state
  if (userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center">
          <LoaderCircle className="h-16 w-16 animate-spin text-green-600" />
          <p className="mt-4 text-xl text-gray-600">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (userError) {
    navigate("/auth/login");
    return null;
  }

  if (!userData) {
    navigate("/auth/login");
    return null;
  }

  if (userData.role !== "ADMIN") {
    if (userData.role === "MENTOR") {
      navigate("/mentor/dashboard");

      return null;
    } else if (userData.role === "INTERN") {
      navigate("/intern/dashboard");

      return null;
    } else {
      navigate("/auth/login");

      return null;
    }
  }

  // Render children if the user is an admin
  return <Outlet />;
};

export default AdminWrapper;
