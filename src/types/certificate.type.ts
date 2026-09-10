import type { JSONContent } from "@tiptap/react";
import type { IUserData } from "./user.type";
import type { ContractLayout } from "@/components/contract/LetterheadCanvas";

export type CertificateType = "completion" | "recommendation";

export interface ICertificateTemplateBase {
  _id: string;
  type: CertificateType;
  title: string;
  companyName: string;
  content: JSONContent;
  layout: ContractLayout;
  createdAt: string;
  createdBy: IUserData;
}

export type TCertificateTemplateForm = Omit<
  ICertificateTemplateBase,
  "_id" | "createdAt" | "createdBy"
>;

export interface ICertificateInstance {
  _id: string;
  template: ICertificateTemplateBase;
  assignedTo: IUserData | string;
  issuedBy: IUserData | string;
  placeholderValues: Record<string, string | undefined>;
  createdAt: string;
}
