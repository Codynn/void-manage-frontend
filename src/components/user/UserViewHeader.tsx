import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Settings, Clock } from "lucide-react";
import type { IUserData } from "@/types/user.type";
import UserEditSheet from "./UserEditSheet";

interface UserViewHeaderProps {
  userData: IUserData;
  currentUserRole?: string;
  getUserInitials: (username: string) => string;
  getRoleColor: (role: string) => string;
}

const UserViewHeader = ({
  userData,
  currentUserRole,
  getUserInitials,
  getRoleColor,
}: UserViewHeaderProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/${
              currentUserRole === "ADMIN" ? "admin/users" : "mentor/dashboard"
            }`}
          >
            <Button variant="ghost" size="sm" className="rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt={userData.username} />
              <AvatarFallback className="text-sm font-medium bg-gray-600 text-white">
                {getUserInitials(userData.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {userData.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm">
                <Mail className="w-3 h-3" />
                {userData.email}
              </p>
            </div>
          </div>
          <Badge className={`${getRoleColor(userData.role)} border text-xs`}>
            {userData.role}
          </Badge>
        </div>
        {currentUserRole === "ADMIN" && (
          <div className="flex items-center gap-2">
            <Link to={`/admin/time-history/${userData._id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Clock className="w-4 h-4" />
                Time History
              </Button>
            </Link>
            <UserEditSheet user={userData}>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Manage
              </Button>
            </UserEditSheet>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserViewHeader;
