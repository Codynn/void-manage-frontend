import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Target, Star, Award, Trophy } from "lucide-react";
import type { IUserData } from "@/types/user.type";

interface UserProgressOverviewProps {
  userData: IUserData;
}

const UserProgressOverview = ({ userData }: UserProgressOverviewProps) => {
  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-gray-600" />
          Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Overall Progress
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {userData.overallProgress}%
            </span>
          </div>
          <Progress value={userData.overallProgress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>{userData.daysCompleted} of {userData.duration} days</span>
            <span>{userData.duration - userData.daysCompleted} days remaining</span>
          </div>
        </div>

        {/* Current Phase */}
        {userData.currentPhase && userData.currentPhase.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Current Phase</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {userData.currentPhase.map((phase: any, index: number) => (
                  <Badge key={phase?._id || index} variant="secondary" className="text-xs">
                    {typeof phase === "string" ? phase : phase?.name}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Achievements */}
        {userData.achievements && userData.achievements.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Achievements ({userData.achievements.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {userData.achievements.map((achievement: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    {achievement}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProgressOverview;
