

export interface ITimeDataBase {
  _id: string;
  intern: string;
  checkInTime: string; // ISO date string
  checkOutTime: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  durationHours: number; // in hours
  autoClosed?: boolean;
  autoCloseReason?: string;
  flagged?: boolean;
  flagReason?: string;
  flaggedBy?: { _id: string; username?: string } | string;
  flaggedAt?: string;
}
