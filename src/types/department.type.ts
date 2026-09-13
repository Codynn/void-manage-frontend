export type SystemRole = "ADMIN" | "MENTOR" | "INTERN";

export interface IRoleTemplate {
  role: SystemRole;
  contractTemplate?: { _id: string; title: string; companyName: string } | string | null;
  phaseTemplate?: { _id: string; name: string } | string | null;
}

export interface IDepartment {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  roleTemplates: IRoleTemplate[];
  createdAt: string;
}
