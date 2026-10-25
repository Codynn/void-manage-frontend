// Room: pure categorization label (a physical room can group many spaces).
export interface IRoom {
  _id: string;
  name: string;
  code?: string;
  location?: string;
  status: "active" | "inactive";
  createdAt: string;
}

// Space: the actual bookable/allocatable unit.
export interface ISpace {
  _id: string;
  name: string;
  code?: string;
  location?: string;
  room?: { _id: string; name: string; location?: string } | string | null;
  capacity?: number;
  amenities?: string[];
  status: "active" | "inactive";
  createdAt: string;
}

export type SpaceAllocationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type SpaceAllocationType = "DEFAULT" | "REQUESTED";

export interface ISpaceAllocationUserRef {
  _id: string;
  username: string;
  email: string;
}

export interface ISpaceAllocation {
  _id: string;
  space: ISpace | string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string | null;
  purpose?: string;
  bookedBy: ISpaceAllocationUserRef | string;
  status: SpaceAllocationStatus;
  allocationType: SpaceAllocationType;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  overridden?: boolean;
  swappedWith?: string;
  history: {
    space: string;
    date: string;
    startTime: string;
    endTime: string | null;
    status: string;
    changedAt: string;
    reason?: string;
    action?: string;
  }[];
  createdAt: string;
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface IRoutineDateOverride {
  _id?: string;
  date: string;
  status: "moved" | "cleared" | "swapped";
  relocatedSpace?: string;
  relocatedStartTime?: string;
  relocatedEndTime?: string;
  note?: string;
}

export interface ISpaceRoutine {
  _id: string;
  space: ISpace | string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  title: string;
  batch?: string;
  isActive: boolean;
  dateOverrides: IRoutineDateOverride[];
}

export interface ISpaceAvailabilityBlock {
  source: "routine" | "allocation";
  routineId?: string;
  allocationId?: string;
  title: string;
  batch?: string;
  bookedBy?: ISpaceAllocationUserRef;
  status?: SpaceAllocationStatus;
  allocationType?: SpaceAllocationType;
  overridden?: string;
  startTime: string;
  endTime: string;
}

export interface ISpaceAvailability {
  space: ISpace;
  date: string;
  dayName: DayOfWeek;
  busy: ISpaceAvailabilityBlock[];
}

export interface ISpaceAuditLog {
  _id: string;
  entityType: "Room" | "Space" | "SpaceRoutine" | "SpaceAllocation";
  entityId: string;
  space?: { _id: string; name: string };
  action: string;
  performedBy?: { _id: string; username: string; email: string };
  message?: string;
  createdAt: string;
}
