import type { IUserData } from "./user.type";

export const LEAVE_TYPES = {
    SICK_LEAVE: "SICK_LEAVE",
    CASUAL_LEAVE: "CASUAL_LEAVE",
    EARNED_LEAVE: "EARNED_LEAVE",
    MATERNITY_LEAVE: "MATERNITY_LEAVE",
    PATERNITY_LEAVE: "PATERNITY_LEAVE",
    ANNUAL_LEAVE: "ANNUAL_LEAVE",
    COMPENSATORY_LEAVE: "COMPENSATORY_LEAVE",
    BEREAVEMENT_LEAVE: "BEREAVEMENT_LEAVE",
    STUDY_LEAVE: "STUDY_LEAVE",
    UNPAID_LEAVE: "UNPAID_LEAVE",
    HALF_DAY_LEAVE: "HALF_DAY_LEAVE",
    EMERGENCY_LEAVE: "EMERGENCY_LEAVE",
    PERSONAL_LEAVE: "PERSONAL_LEAVE",
    VACATION_LEAVE: "VACATION_LEAVE",
    DUTY_LEAVE: "DUTY_LEAVE"
} as const;

export const LEAVE_TYPE_LABELS = {
    SICK_LEAVE: "Sick Leave",
    CASUAL_LEAVE: "Casual Leave",
    EARNED_LEAVE: "Earned Leave",
    MATERNITY_LEAVE: "Maternity Leave",
    PATERNITY_LEAVE: "Paternity Leave",
    ANNUAL_LEAVE: "Annual Leave",
    COMPENSATORY_LEAVE: "Compensatory Leave",
    BEREAVEMENT_LEAVE: "Bereavement Leave",
    STUDY_LEAVE: "Study Leave",
    UNPAID_LEAVE: "Unpaid Leave",
    HALF_DAY_LEAVE: "Half Day Leave",
    EMERGENCY_LEAVE: "Emergency Leave",
    PERSONAL_LEAVE: "Personal Leave",
    VACATION_LEAVE: "Vacation Leave",
    DUTY_LEAVE: "Duty Leave"
} as const;

export type LeaveType = keyof typeof LEAVE_TYPES;

export interface ILeaveRequest {
  _id: string;
  intern: IUserData;
  leaveType: LeaveType;
  startDate: string;
  days: number;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export type TLeaveRequestForm = Omit<
  ILeaveRequest,
  "_id" | "intern" | "status" | "createdAt" | "updatedAt"
>;
