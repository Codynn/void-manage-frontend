export { default as UserCard } from "./UserCard";
export { default as UserStats } from "./UserStats";
export { default as UserGrid } from "./UserGrid";
export { default as AddUserDialog } from "./AddUserDialog";
export { default as UserViewHeader } from "./UserViewHeader";
export { default as UserStatsCards } from "./UserStatsCards";
export { default as UserProgressOverview } from "./UserProgressOverview";
export { default as UserWelcomePhotos } from "./UserWelcomePhotos";
export { default as UserQuickInfo } from "./UserQuickInfo";
export { default as UserMentorAssignment } from "./UserMentorAssignment";
export { default as UserAssignedProjects } from "./UserAssignedProjects";
export { default as UserAssignedLeaves } from "./UserAssignedLeaves";
export { default as UserQuickLinks } from "./UserQuickLinks";
export { default as UserViewSkeleton } from "./UserViewSkeleton";
export { default as MilestoneSection } from "./MilestoneSection";
export { default as MilestoneStats } from "./MilestoneStats";
export { default as MilestoneCard } from "./MilestoneCard";
export { default as CheckpointsList } from "./CheckpointsList";
export { default as AssignTemplateDialog } from "./AssignTemplateDialog";
export { UserAssignedContract } from "./UserAssignedContract";
export { AssignContractDialog } from "./AssignContractDialog";
export { UserCertificates } from "./UserCertificates";
export { UserDailyChecklist } from "./UserDailyChecklist";

// Re-export hooks
export { useMilestoneUpdates } from "./hooks/useMilestoneUpdates";

// Re-export types
export type { IUserData } from "@/types/user.type";
export type * from "./user-view.types";
