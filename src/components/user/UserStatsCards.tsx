import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, TrendingUp, Briefcase } from "lucide-react";
import type { IUserData } from "@/types/user.type";

interface UserStatsCardsProps {
  userData: IUserData;
}

const UserStatsCards = ({ userData }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {userData.daysCompleted}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Days Completed
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {userData.totalWorkedHours}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Hours Worked
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <TrendingUp className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {userData.overallProgress}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Progress
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <Briefcase className="w-5 h-5 text-gray-600 mx-auto mb-1" />
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {userData.assignedProjects?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Projects
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStatsCards;
