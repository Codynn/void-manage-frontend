import type { LeaveType } from "./leave.type";

export interface ILeavePolicyLeave {
  leaveType: LeaveType;
  totalLeavesAvailable: number;
}

export interface ILeavePolicy {
  _id: string;
  name: string;
  description?: string;
  leaves: ILeavePolicyLeave[];
  createdAt: string;
  updatedAt: string;
}

export type TLeavePolicyForm = Pick<ILeavePolicy, "name" | "description" | "leaves">;
