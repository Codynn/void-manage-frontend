import { QueryProvider } from "@/providers/QueryProvider";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const RootLayout = () => {
  return (
    <QueryProvider>
      <div className="bg-[#d2e1cbbc]">
        <Outlet />
      </div>

      <Toaster />
    </QueryProvider>
  );
};

export default RootLayout;
