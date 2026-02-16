
import { Users } from "lucide-react";
import UserCard from "./UserCard";
import type { IUserData } from "@/types/user.type";

interface UserGridProps {
  usersList: IUserData[];
  isLoading: boolean;
  showDeleteOption?: boolean;
}

const UserGrid = ({ usersList, isLoading, showDeleteOption = false }: UserGridProps) => {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-96"></div>
          </div>
        ))}
      </div>
    );
  }

  if (usersList.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No users found</h3>
        <p className="text-muted-foreground">There are no users in this category yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {usersList.map((user: IUserData) => (
        <UserCard
          key={user._id}
          user={user}
          showDeleteOption={showDeleteOption}
        />
      ))}
    </div>
  );
};

export default UserGrid;
