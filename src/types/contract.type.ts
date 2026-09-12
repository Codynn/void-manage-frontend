import type { JSONContent } from "@tiptap/react";
import type { IUserData } from "./user.type";
import type { ContractLayout } from "@/components/contract/LetterheadCanvas";

export interface IContractTemplateBase {
  _id: string;
  title: string;
  companyName: string;
  content: JSONContent;
  layout: ContractLayout;
  createdAt: string;
  createdBy: IUserData;
}

export type TContractTemplateForm = Omit<
  IContractTemplateBase,
  "_id" | "createdAt" | "createdBy"
>;

export interface IContractInstance {
  _id: string;
  model: IContractTemplateBase;
  assignedTo: IUserData | string;
  agreedToTerms: boolean;
  status: "pending" | "signed" | "approved" | "rejected";
  signedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionMessage?: string;
  signatureFileUrl?: { url: string; file: string };
  placeholderValues: Record<string, string | undefined>;
  contentOverride?: JSONContent | null;
  layoutOverride?: ContractLayout | null;
  createdAt: string;
}
