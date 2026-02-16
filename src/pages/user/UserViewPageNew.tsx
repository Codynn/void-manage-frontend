import { Link, useParams } from "react-router-dom";
import { useGetUserById, useGetUserData } from "@/services/api/user.api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User } from "lucide-react";
import { useGetLinksByInternId } from "@/services/api/link.api";
import {
  UserViewHeader,
  UserStatsCards,
  UserProgressOverview,
  UserWelcomePhotos,
  UserQuickInfo,
  UserMentorAssignment,
  UserAssignedProjects,
  UserQuickLinks,
  UserViewSkeleton,
} from "@/components/user";

const UserViewPage = () => {
  const params = useParams();
  const { data: userData, isLoading } = useGetUserById(params.userId);
  const { data: currentUserData } = useGetUserData();
  const { data: linksList } = useGetLinksByInternId(userData?._id);

  const currentUserRole = currentUserData?.role;

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
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
      case "MENTOR":
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
      case "INTERN":
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return <UserViewSkeleton />;
  }

  if (!userData) {
    return (
      <main className="min-h-screen bg-gray-50 p-3 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="max-w-sm rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                User not found
              </h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                The user you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/users">
                <Button size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-3 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <UserViewHeader
          userData={userData}
          currentUserRole={currentUserRole}
          getUserInitials={getUserInitials}
          getRoleColor={getRoleColor}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Main Content - 3/4 width */}
          <div className="space-y-4 lg:col-span-3">
            {/* Stats Overview */}
            <UserStatsCards userData={userData} />

            {/* Progress Details */}
            <UserProgressOverview userData={userData} />

            {/* Welcome Photos */}
            <UserWelcomePhotos userData={userData} currentUserRole={currentUserRole} />
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="space-y-4">
            {/* Quick Info */}
            <UserQuickInfo userData={userData} formatDate={formatDate} />

            {/* Mentor Assignment */}
            <UserMentorAssignment
              userData={userData}
              currentUserRole={currentUserRole}
              getUserInitials={getUserInitials}
            />

            {/* Assigned Projects */}
            <UserAssignedProjects userData={userData} />

            {/* Quick Links */}
            <UserQuickLinks linksList={linksList} />
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserViewPage;
