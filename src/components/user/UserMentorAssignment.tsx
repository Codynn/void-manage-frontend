import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCheck, Users, LoaderCircle, X } from "lucide-react";
import {
  useGetUsers,
  useAssignMentor,
  useUpdateUser,
} from "@/services/api/user.api";
import type { IUserData } from "@/types/user.type";
import { useQueryClient } from "@tanstack/react-query";

interface UserMentorAssignmentProps {
  userData: IUserData;
  currentUserRole?: string;
  getUserInitials: (username: string) => string;
}

const UserMentorAssignment = ({
  userData,
  currentUserRole,
  getUserInitials,
}: UserMentorAssignmentProps) => {
  const queryClient = useQueryClient();
  const { data: usersResponse } = useGetUsers();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const [selectedMentor, setSelectedMentor] = useState("");
  const [assignMentorOpen, setAssignMentorOpen] = useState(false);
  const assignMentorMutation = useAssignMentor();

  const usersList = usersResponse?.items || [];
  const mentors = usersList.filter((user: IUserData) => user.role === "MENTOR");

  const handleAssignMentor = async () => {
    if (!selectedMentor || !userData) return;

    try {
      await assignMentorMutation.mutateAsync({
        internUsername: userData.username,
        mentorUsername: selectedMentor,
      });

      queryClient.invalidateQueries({ queryKey: ["user", userData._id] });
      setAssignMentorOpen(false);
      setSelectedMentor("");
    } catch (error) {
      console.error("Failed to assign mentor:", error);
    }
  };

  const handleMentorRemove = (mentorId: string) => {
    if (isUpdating) return;
    updateUser({
      ...userData,
      mentors: userData.mentors.filter(
        (mentor) => (mentor as IUserData)?._id !== mentorId
      ),
    });
  };

  if (currentUserRole !== "ADMIN" || userData.role !== "INTERN") {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <UserCheck className="h-4 w-4 text-gray-600" />
          Mentor Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {userData.mentors && userData.mentors.length > 0 ? (
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Current Mentors:
            </span>
            <div className="space-y-1">
              {userData.mentors.map((mentor: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-gray-600 text-white">
                      {getUserInitials(mentor?.username || "UN")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {mentor?.username}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                      {mentor?.email}
                    </p>
                  </div>
                  <button onClick={() => handleMentorRemove(mentor._id)} className="hover:cursor-pointer">
                    <X size={18} color="red"/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <p className="text-xs">No mentors assigned</p>
          </div>
        )}

        <Dialog open={assignMentorOpen} onOpenChange={setAssignMentorOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full gap-2">
              <UserCheck className="h-3 w-3" />
              Assign Mentor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Mentor</DialogTitle>
              <DialogDescription>
                Select a mentor to assign to {userData.username}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mentor">Select Mentor</Label>
                <Select
                  value={selectedMentor}
                  onValueChange={setSelectedMentor}
                >
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Choose a mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors?.map((mentor: IUserData) => (
                      <SelectItem key={mentor._id} value={mentor?.username}>
                        {mentor?.username} ({mentor?.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAssignMentorOpen(false)}
                disabled={assignMentorMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignMentor}
                disabled={assignMentorMutation.isPending || !selectedMentor}
              >
                {assignMentorMutation.isPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  "Assign Mentor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default UserMentorAssignment;
