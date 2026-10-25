import type { IProjectBase } from "./project.type";
import type { LeaveType } from "./leave.type";

export interface IAssignedLeave {
  leaveType: LeaveType;
  totalLeavesAvailable: number;
  takenLeaves: number;
}
export interface IAssignedLeaveForm {
  leaveType: LeaveType;
  totalLeavesAvailable: number;
}

export interface IUserData {
  _id: string;
  username: string;
  email: string;
  mentors: (string | IUserData)[];
  assignedProjects: (string | IProjectBase)[];
  role: "INTERN" | "ADMIN" | "MENTOR" | string;
  createdAt: string;
  updatedAt: string;
  achievements: string[];
  currentPhase: { _id: string; name: string; order?: number; progress?: number; isCompleted?: boolean; status?: string }[];
  daysCompleted: number;
  duration: number;
  overallProgress: number;
  startDate: string;
  totalWorkedHours: number;
  welcomePhotos?: string[];
  assignedLeaves: IAssignedLeave[];
  archived?: boolean;
  mustChangePassword?: boolean;
  department?: { _id: string; name: string } | string | null;
  defaultSpace?: { _id: string; name: string; location?: string } | string | null;
  fullName?: string;
  address?: string;
}
