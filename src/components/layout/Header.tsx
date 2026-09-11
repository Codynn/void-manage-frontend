import { useGetUserData } from "@/services/api/user.api";
import { Skeleton } from "../ui/skeleton";

const Header = () => {
  const { data: userData, isLoading } = useGetUserData();

  if (isLoading)
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-6 w-full" />
      </div>
    );

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        Welcome back, {userData?.username}!
      </h1>
      <p className="text-muted-foreground">Manage the entire internship program</p>
    </div>
  );
};

export default Header;
