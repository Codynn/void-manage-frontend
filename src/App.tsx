import { useNavigate } from "react-router-dom";
import { useGetUserData } from "./services/api/user.api";
import { LoaderCircle } from "lucide-react";
import { useEffect } from "react";

const App = () => {
  const navigate = useNavigate();
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserData();

  useEffect(() => {
    if (userLoading) return; // Wait until loading is finished

    if (!userData || userError) {
      navigate("/auth/login");
    } else if (userData?.role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (userData?.role === "MENTOR") {
      navigate("/mentor/dashboard");
    } else if (userData?.role === "INTERN") {
      navigate("/intern/dashboard");
    } else {
      navigate("/auth/login");
    }
  }, [userLoading, userData, userError, navigate]);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center">
          <LoaderCircle className="animate-spin w-16 h-16 text-green-600" />
          <p className="mt-4 text-xl text-gray-600">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
