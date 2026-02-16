export interface TLoginForm {
  email: string;
  password: string;
}
export type NotificationType = "feedback" | "task" | "milestone" | "system";

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
