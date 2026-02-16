import { useGetUserData } from "@/services/api/user.api";
import { Badge } from "../ui/badge";
import { NotificationsPopup } from "../header/notification-popup";
import { ProfilePopup } from "../header/profile-popup";
import { Skeleton } from "../ui/skeleton";
import VoidLogo from "@/assets/void_manage_logo.png";

const Header = () => {
  const { data: userData, isLoading } = useGetUserData();

  if (isLoading)
    return (
      <div className="flex items-center justify-between p-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-full" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );

  return (
    <div className="flex items-center justify-between">
      <div className="flex  items-center gap-8">
        <img
          src={VoidLogo}
          alt="Void Manage Logo"
          className="w-45 h-20 object-contain filter drop-shadow-sm"
        />
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {userData?.username}!
          </h1>
          <p className="text-muted-foreground">
            Manage the entire internship program
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Badge className="bg-green-600 text-white">{userData?.role}</Badge>
        <NotificationsPopup />
        <ProfilePopup user={userData} />
      </div>
    </div>
  );
};

export default Header;
