import type { IUserData } from "./user.type";

export interface ITaskBase {
  _id: string;
  title: string;
  status: string;
  project: string;
  assignedTo: string | IUserData;
  timeline: {
    start: string;
    end: string;
  };
}

export interface IProjectBase {
  _id: string;
  name: string;
  status: string;
  type: string;
  description: string;
  progress: number;
  technologies: string[];
  assignedUsers: IUserData[];
  tasks: ITaskBase[];
  timeline: {
    start: string;
    end: string;
  };
}

export type TTaskForm = Omit<ITaskBase, "_id" | "project" | "assignedTo"> & {
    project: string;
    assignedTo: string;
};

export type TProjectForm = Omit<IProjectBase, "_id" | "assignedUsers" | "progress"> & {
  status?: string;
  assignedUsers: string[];
};
