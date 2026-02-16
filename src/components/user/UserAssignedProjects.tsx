import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import type { IUserData } from "@/types/user.type";
import { Link } from "react-router-dom";
import { useGetUserData } from "@/services/api/user.api";

interface UserAssignedProjectsProps {
  userData: IUserData;
}

const UserAssignedProjects = ({ userData }: UserAssignedProjectsProps) => {
  const { data: profileData } = useGetUserData();
  if (!userData.assignedProjects || userData.assignedProjects.length === 0) {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4 text-gray-600" />
          Assigned Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {userData?.assignedProjects?.map((project, index) => {
            if (typeof project === "string") return null; // Or handle string case if needed

            return (
              <Link
                to={`/${profileData?.role?.toLowerCase()}/project/${
                  project._id
                }`}
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
              >
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {project.name}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAssignedProjects;
