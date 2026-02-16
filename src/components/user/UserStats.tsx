import { Card } from "@/components/ui/card";
import { Users, User, Trophy, CheckCircle } from "lucide-react";
import type { IUserData } from "@/types/user.type";

interface UserStatsProps {
  usersList: IUserData[];
}

const UserStats = ({ usersList }: UserStatsProps) => {
  const stats = [
    {
      title: "Total Users",
      value: usersList.length,
      icon: Users,
      color: "text-blue-500"
    },
    {
      title: "Admins",
      value: usersList.filter((u: IUserData) => u.role === 'ADMIN').length,
      icon: User,
      color: "text-red-500"
    },
    {
      title: "Mentors",
      value: usersList.filter((u: IUserData) => u.role === 'MENTOR').length,
      icon: Trophy,
      color: "text-yellow-500"
    },
    {
      title: "Interns",
      value: usersList.filter((u: IUserData) => u.role === 'INTERN').length,
      icon: CheckCircle,
      color: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Card key={stat.title} className="p-4">
            <div className="flex items-center gap-3">
              <IconComponent className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default UserStats;
