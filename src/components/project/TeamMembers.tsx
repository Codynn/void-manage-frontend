import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IUserData } from "@/types/user.type";

interface TeamMembersProps {
  assignedUsers: IUserData[];
}

export const TeamMembers = ({ assignedUsers }: TeamMembersProps) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Team Members ({assignedUsers.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {assignedUsers.map((user) => (
            <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {user.role}
              </Badge>
            </div>
          ))}
        </div>
        {assignedUsers.length === 0 && (
          <p className="text-gray-500 text-center py-4">No team members assigned</p>
        )}
      </div>
    </Card>
  );
};
