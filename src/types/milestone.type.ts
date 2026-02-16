export interface ICheckpoint {
  _id?: string;
  user?: string;
  phase?: string;
  title: string;
  description?: string;
  dayAssigned?: number;
  dueDay?: string; // Adding from API response
  status?: "pending" | "completed";
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface IPhase {
  _id?: string;
  name: string;
  description: string;
  order: number;
  checkpoints: ICheckpoint[];
  isCompleted?: boolean;
  userId?: string;
}

export interface IPhaseTemplate {
  _id?: string;
  name: string;
  phases: IPhase[];
}

export interface IUserPhase extends IPhase {
  _id: string;
  user: string;
  name: string;
  description: string;
  order: number;
  progress: number;
  status: "pending" | "completed";
  checkpoints: ICheckpoint[];
  isCompleted: boolean;
  startDate: string;
  __v: number;
  phaseProgress?: string; // Adding from API response
  mentorApprovalProgress?: string; // Adding from API response
}

export type TPhaseTemplateForm = Omit<IPhaseTemplate, "_id">;
