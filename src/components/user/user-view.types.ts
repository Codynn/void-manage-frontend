import type { IUserData } from "@/types/user.type";

export interface UserViewHeaderProps {
  userData: IUserData;
  currentUserRole?: string;
  getUserInitials: (username: string) => string;
  getRoleColor: (role: string) => string;
}

export interface UserStatsCardsProps {
  userData: IUserData;
}

export interface UserProgressOverviewProps {
  userData: IUserData;
}

export interface UserWelcomePhotosProps {
  userData: IUserData;
  currentUserRole?: string;
}

export interface UserQuickInfoProps {
  userData: IUserData;
  formatDate: (dateString: string) => string;
}

export interface UserMentorAssignmentProps {
  userData: IUserData;
  currentUserRole?: string;
  getUserInitials: (username: string) => string;
}

export interface UserAssignedProjectsProps {
  userData: IUserData;
}

export interface UserQuickLinksProps {
  linksList?: {
    items: Array<{
      _id: string;
      url: string;
      title: string;
      category: string;
    }>;
  };
}

export interface MilestoneSectionProps {
  userData: IUserData;
}
