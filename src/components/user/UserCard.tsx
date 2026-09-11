import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Clock, Trophy, Calendar, Mail, Star, LoaderCircle, Archive } from "lucide-react";
import { useDeleteUser, useGetUserData } from "@/services/api/user.api";
import type { IUserData } from "@/types/user.type";

interface UserCardProps {
  user: IUserData;
  showDeleteOption?: boolean;
}

const UserCard = ({ user, showDeleteOption = false }: UserCardProps) => {
  const { data: userData } = useGetUserData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteUserMutation = useDeleteUser();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-green-900 text-white";
      case "MENTOR":
        return "bg-green-600 text-white";
      case "INTERN":
        return "bg-green-400 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500 text-white";
    if (progress >= 60) return "bg-yellow-500 text-white";
    return "bg-green-400 text-white";
  };

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(user._id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  return (
    <Link to={userData?.role === "ADMIN" ? `${user._id}` : `/mentor/user/${user._id}`}>
      <Card
        className={`relative cursor-pointer overflow-hidden bg-gradient-to-br from-card to-muted/20 shadow-md transition-all duration-300 hover:shadow-lg`}
      >
        {/* Role Indicator */}
        <div
          className={`absolute right-0 top-0 h-3 w-3 rounded-bl-lg ${
            user.role === "ADMIN"
              ? "bg-(--role-admin)"
              : user.role === "MENTOR"
                ? "bg-(--role-mentor)"
                : "bg-(--role-intern)"
          }`}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span className="text-lg font-semibold">
                  {user?.username?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
                  user.role === "ADMIN"
                    ? "bg-(--role-admin)"
                    : user.role === "MENTOR"
                      ? "bg-(--role-mentor)"
                      : "bg-(--role-intern)]"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-foreground">{user.username}</h3>
              <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge className={`px-2 py-0 text-xs ${getRoleColor(user.role)}`}>
                  {user.role}
                </Badge>
                <Badge className={`px-2 py-0 text-xs ${getProgressColor(user.overallProgress)}`}>
                  {user.overallProgress}%
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">Overall Progress</span>
              <span className="text-muted-foreground">{user.overallProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(user.overallProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{user.daysCompleted} days completed</span>
              <span>{user.duration - user.daysCompleted} days remaining</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
                <Clock className="h-4 w-4" />
                {Number.isInteger(user.totalWorkedHours)
                  ? user.totalWorkedHours
                  : user.totalWorkedHours.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Hours Worked</div>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 text-center">
              <div className="text-lg font-bold text-foreground">
                {user.assignedProjects.length}
              </div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
          </div>

          {/* Current Phase */}
          {user.currentPhase.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Star className="text-(--icon-star) h-3 w-3" />
                <span className="text-xs font-medium text-foreground">Current Phase</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {user.currentPhase.map((phase: any, index: number) => (
                  <Badge
                    key={phase?._id || index}
                    variant="outline"
                    className="border-border px-1.5 py-0 text-xs text-foreground"
                  >
                    {typeof phase === "string" ? phase : phase?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {user.achievements.length > 0 && (
            <div className="space-y-1">
              <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                <Trophy className="text-(--icon-trophy) h-3 w-3" />
                Achievements ({user.achievements.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {user.achievements.slice(0, 2).map((achievement, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-border px-1.5 py-0 text-xs text-foreground"
                  >
                    {achievement}
                  </Badge>
                ))}
                {user.achievements.length > 2 && (
                  <Badge
                    variant="outline"
                    className="border-border px-1.5 py-0 text-xs text-foreground"
                  >
                    +{user.achievements.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Join Date */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Joined:
            </span>
            <span className="font-medium text-foreground">{formatDate(user.startDate)}</span>
          </div>

          {/* Action Buttons */}
          <div className=" flex items-center gap-x-2">
            <Link
              to={userData?.role === "ADMIN" ? `${user._id}` : `/mentor/user/${user._id}`}
              className="flex-1"
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Eye className="mr-1 h-3 w-3" />
                View Details
              </Button>
            </Link>

            {showDeleteOption && (
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-(--destructive-hover) w-full flex-1 border-destructive bg-transparent text-destructive"
                  >
                    <Archive className="mr-1 h-3 w-3" />
                    Archive User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Archive User</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to archive {user.username}? This action cannot be
                      undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={deleteUserMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteUserMutation.isPending}
                    >
                      {deleteUserMutation.isPending ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Archiving...
                        </>
                      ) : (
                        "Archive User"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default UserCard;
