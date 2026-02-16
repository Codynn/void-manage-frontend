import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import type { IUserData } from "@/types/user.type";
import { LEAVE_TYPE_LABELS } from "@/types/leave.type";
import UserEditSheet from "./UserEditSheet";
import { Button } from "../ui/button";

interface UserAssignedLeavesProps {
  userData: IUserData;
}

const UserAssignedLeaves = ({ userData }: UserAssignedLeavesProps) => {
  if (!userData.assignedLeaves || userData.assignedLeaves.length === 0) {
    return (
      <Card className="border-0 shadow-sm gap-0">
        <CardHeader className="pb-2 ">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-600" />
            Assigned Leaves
            <UserEditSheet user={userData}>
              <Button size="sm" className=" ml-auto">Update</Button>
            </UserEditSheet>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">No leave types assigned</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressPercentage = (taken: number, total: number) => {
    return total > 0 ? Math.min((taken / total) * 100, 100) : 0;
  };

  const getProgressColor = (taken: number, total: number) => {
    const percentage = getProgressPercentage(taken, total);
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2 ">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-600" />
            Assigned Leaves
            <UserEditSheet user={userData}>
              <Button size="sm" className=" ml-auto">Update</Button>
            </UserEditSheet>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {userData.assignedLeaves.map((leave, index) => {
            const percentage = getProgressPercentage(
              leave.takenLeaves,
              leave.totalLeavesAvailable
            );
            const progressColor = getProgressColor(
              leave.takenLeaves,
              leave.totalLeavesAvailable
            );
            const leaveLabel =
              LEAVE_TYPE_LABELS[
                leave.leaveType as keyof typeof LEAVE_TYPE_LABELS
              ] || leave.leaveType;

            return (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full" />
                    <span className="font-medium text-xs text-gray-900 dark:text-white">
                      {leaveLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <Clock className="h-3 w-3" />
                    <span>
                      {leave.takenLeaves}/{leave.totalLeavesAvailable}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Details */}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Remaining: {leave.totalLeavesAvailable - leave.takenLeaves}
                  </span>
                  <span>{percentage.toFixed(0)}% used</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAssignedLeaves;
