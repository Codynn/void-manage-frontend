import type { IUserData } from "./user.type";

export interface IContractTemplateBase {
  _id: string;
  title: string;
  terms: string[];
  tools: string[];
  totalDurationHours: number;
  mode: "remote" | "onsite" | "hybrid";
  companyName: string;
  description?: string;
  createdAt: string;
  createdBy: IUserData;
}

export type TContractTemplateForm = Omit<
  IContractTemplateBase,
  "_id" | "createdAt" | "createdBy"
>;
