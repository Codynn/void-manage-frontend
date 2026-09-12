export interface IDepartment {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface IDepartmentRole {
  _id: string;
  department: string;
  title: string;
  description?: string;
  contractTemplate?: { _id: string; title: string; companyName: string } | string | null;
  phaseTemplate?: { _id: string; name: string } | string | null;
  status: "active" | "inactive";
  createdAt: string;
}
