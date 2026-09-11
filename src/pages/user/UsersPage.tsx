import { useState, useMemo } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { useGetUsers } from "@/services/api/user.api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserStats from "@/components/user/UserStats";
import UserGrid from "@/components/user/UserGrid";
import MentorInternGrid from "@/components/user/MentorInternGrid";
import AddUserDialog from "@/components/user/AddUserDialog";
import BulkUploadUsersDialog from "@/components/user/BulkUploadUsersDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IUserData } from "@/types/user.type";

const USERS_PER_PAGE = 9;

const                UsersPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: usersResponse, isLoading: usersLoading } = useGetUsers();

  const currentUserRole = "ADMIN";

  const usersList = usersResponse?.items || [];
  const filteredUsers = useMemo(
    () => ({
      all: usersList,
      mentors: usersList.filter((user: IUserData) => user.role === "MENTOR"),
      interns: usersList.filter((user: IUserData) => user.role === "INTERN"),
      admins: usersList.filter((user: IUserData) => user.role === "ADMIN"),
    }),
    [usersList]
  );

  const mentorInternPairs = useMemo(() => {
    return filteredUsers.mentors.map((mentor: IUserData) => {
      const assignedInterns = filteredUsers.interns.filter((intern: IUserData) => {
        return intern.mentors?.some((m: any) => {
          return (
            m._id === mentor._id ||
            m.id === mentor._id ||
            m === mentor._id ||
            m?.username === mentor.username
          );
        });
      });

      return { mentor, interns: assignedInterns };
    });
  }, [filteredUsers.mentors, filteredUsers.interns]);

  const getPaginatedUsers = (users: IUserData[]) => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    return users.slice(startIndex, endIndex);
  };

  const getTotalPages = (users: IUserData[]) => {
    return Math.ceil(users.length / USERS_PER_PAGE);
  };

  // Get current tab's users
  const getCurrentTabUsers = () => {
    switch (activeTab) {
      case "all":
        return filteredUsers.all;
      case "interns":
        return filteredUsers.interns;
      case "mentors":
        return filteredUsers.mentors;
      case "admins":
        return filteredUsers.admins;
      default:
        return filteredUsers.all;
    }
  };

  const currentTabUsers = getCurrentTabUsers();
  const totalPages = getTotalPages(currentTabUsers);
  const paginatedUsers = getPaginatedUsers(currentTabUsers);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="mt-6 flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <TitleHeader
          title="User Management"
          description="Manage users and their roles within the organization"
          link="/admin/dashboard"
        />
        <div className="flex gap-2">
          <BulkUploadUsersDialog />
          <AddUserDialog />
        </div>
      </div>

      <UserStats usersList={usersList} />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Users ({filteredUsers.all.length})</TabsTrigger>
          <TabsTrigger value="mentor-intern">Mentor-Intern Pairs</TabsTrigger>
          <TabsTrigger value="interns">Interns ({filteredUsers.interns.length})</TabsTrigger>
          <TabsTrigger value="mentors">Mentors ({filteredUsers.mentors.length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({filteredUsers.admins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <UserGrid
            usersList={paginatedUsers}
            isLoading={usersLoading}
            showDeleteOption={currentUserRole === "ADMIN"}
          />
          <PaginationControls />
        </TabsContent>

        <TabsContent value="mentor-intern" className="mt-6">
          <MentorInternGrid
            mentorInternPairs={mentorInternPairs}
            isLoading={usersLoading}

          />
        </TabsContent>

        <TabsContent value="interns" className="mt-6">
          <UserGrid
            usersList={paginatedUsers}
            isLoading={usersLoading}
            showDeleteOption={currentUserRole === "ADMIN"}
          />
          <PaginationControls />
        </TabsContent>

        <TabsContent value="mentors" className="mt-6">
          <UserGrid
            usersList={paginatedUsers}
            isLoading={usersLoading}
            showDeleteOption={currentUserRole === "ADMIN"}
          />
          <PaginationControls />
        </TabsContent>

        <TabsContent value="admins" className="mt-6">
          <UserGrid
            usersList={paginatedUsers}
            isLoading={usersLoading}
            showDeleteOption={currentUserRole === "ADMIN"}
          />
          <PaginationControls />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default UsersPage;
