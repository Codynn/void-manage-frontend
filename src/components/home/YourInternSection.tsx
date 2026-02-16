
import { Card, CardContent, CardHeader } from "../ui/card";
import { useGetUsers } from "@/services/api/user.api";
import { UserCard, type IUserData } from "../user";

const YourInternSection = () => {
  const { data: usersList, isLoading: isUserLoading } = useGetUsers();

  return (
    <Card className="gap-0">
      <CardHeader className="gap-0">
        <h2 className="text-2xl font-semibold">Your Interns</h2>
        <p>Manage and track intern progress</p>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isUserLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-96"></div>
              </div>
            ))}
          </div>
        ) : (
          usersList?.items?.map((user: IUserData) => (
            <UserCard key={user._id} user={user} showDeleteOption={false} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default YourInternSection;
