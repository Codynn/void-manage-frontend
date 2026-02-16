import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User } from "lucide-react";
import type { IUserData } from "@/types/user.type";

interface UserQuickInfoProps {
  userData: IUserData;
  formatDate: (dateString: string) => string;
}

const UserQuickInfo = ({ userData, formatDate }: UserQuickInfoProps) => {
  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Quick Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-600" />
              <span>Join Date</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              {formatDate(userData.startDate)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-600" />
              <span>Duration</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              {userData.duration} days
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-gray-600" />
              <span>Created</span>
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              {formatDate(userData.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserQuickInfo;
