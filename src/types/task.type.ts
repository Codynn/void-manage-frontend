export interface User {
  _id: string;
  username?: string;
  email?: string;
  role?: string;
}

export interface RoleBasedTask {
  _id: string;
  name: string;
  description?: string;
  mandatory: boolean;
  completed: boolean;
  type: "role-based";
}

export interface IndividualTask {
  _id: string;
  name: string;
  description?: string;
  mandatory: boolean;
  completed: boolean;
  dueDate?: string;
  assignedBy?: User;
  type: "individual";
}

export type DailyChecklistTask = RoleBasedTask | IndividualTask;
