export interface ILinkBase {
  _id: string;
  category: string;
  title: string;
  url: string;
  visibleToInterns: boolean;
  assignedTo: string[];
}


export type TLinkFormValues = Omit<ILinkBase, "_id">;