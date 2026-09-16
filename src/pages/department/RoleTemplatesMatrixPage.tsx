import { useNavigate } from "react-router-dom";
import TitleHeader from "@/components/layout/TitleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ShieldCheck, Users, Building2 } from "lucide-react";
import { useGetDepartments, useUpdateDepartmentRoleTemplate } from "@/services/api/department.api";
import { useGetContractTemplates } from "@/services/api/contract.api";
import { useGetPhaseTemplates } from "@/services/api/milestone.api";
import { useGetLeavePolicies } from "@/services/api/leavePolicy.api";
import SelectWithCreate, { NONE_SENTINEL } from "@/components/common/SelectWithCreate";
import type { IDepartment, SystemRole } from "@/types/department.type";

const ROLES: SystemRole[] = ["INTERN", "MENTOR", "ADMIN"];

const ROLE_META: Record<SystemRole, { label: string; icon: typeof Users }> = {
  INTERN: { label: "Intern", icon: GraduationCap },
  MENTOR: { label: "Mentor", icon: Users },
  ADMIN: { label: "Admin", icon: ShieldCheck },
};

const idOf = (value: any): string => {
  if (!value) return NONE_SENTINEL;
  return typeof value === "object" ? value._id : value;
};

// One screen to configure every department x role's contract/phase/leave
// mapping, instead of clicking into each department individually (the N*M
// problem: N departments x M roles, each needing 3 picks).
const RoleTemplatesMatrixPage = () => {
  const navigate = useNavigate();
  const { data: departments, isLoading } = useGetDepartments();
  const { data: contractTemplates } = useGetContractTemplates();
  const { data: phaseTemplates } = useGetPhaseTemplates();
  const { data: leavePolicies } = useGetLeavePolicies();
  const { mutate: updateRoleTemplate, isPending } = useUpdateDepartmentRoleTemplate();

  const contractItems = (contractTemplates?.items || []).map((c: any) => ({
    _id: c._id,
    label: c.title,
  }));
  const phaseItems = (phaseTemplates || []).map((p: any) => ({ _id: p._id, label: p.name }));
  const leaveItems = (leavePolicies || []).map((l) => ({ _id: l._id, label: l.name }));

  const activeDepartments = (departments || []).filter((d) => d.status === "active");

  const handleChange = (
    department: IDepartment,
    role: SystemRole,
    field: "contractTemplate" | "phaseTemplate" | "leavePolicy",
    value: string
  ) => {
    updateRoleTemplate({
      departmentId: department._id,
      role,
      contractTemplate: field === "contractTemplate" ? (value === NONE_SENTINEL ? null : value) : undefined,
      phaseTemplate: field === "phaseTemplate" ? (value === NONE_SENTINEL ? null : value) : undefined,
      leavePolicy: field === "leavePolicy" ? (value === NONE_SENTINEL ? null : value) : undefined,
    });
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Role Templates"
        description="Configure the contract, phase, and leave policy auto-assigned to every department + role combination, all in one place"
        link="/admin/dashboard"
      />

      {!isLoading && activeDepartments.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3" />
          No departments yet.{" "}
          <button className="text-primary hover:underline" onClick={() => navigate("/admin/departments")}>
            Create one first
          </button>
          .
        </Card>
      )}

      <div className="space-y-6">
        {activeDepartments.map((department) => (
          <Card key={department._id}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{department.name}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="py-2 pr-4 font-medium">Role</th>
                      <th className="py-2 pr-4 font-medium">Contract Template</th>
                      <th className="py-2 pr-4 font-medium">Phase Template</th>
                      <th className="py-2 font-medium">Leave Policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.map((role) => {
                      const mapping = department.roleTemplates?.find((rt) => rt.role === role);
                      const Icon = ROLE_META[role].icon;
                      return (
                        <tr key={role} className="border-b last:border-0">
                          <td className="py-3 pr-4 align-top">
                            <Badge variant="outline" className="gap-1.5 font-normal">
                              <Icon className="h-3 w-3" />
                              {ROLE_META[role].label}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 align-top">
                            <SelectWithCreate
                              value={idOf(mapping?.contractTemplate)}
                              onChange={(v) => handleChange(department, role, "contractTemplate", v)}
                              items={contractItems}
                              createLabel="Create new contract template"
                              onCreate={() => navigate("/admin/contract/create")}
                              disabled={isPending}
                            />
                          </td>
                          <td className="py-3 pr-4 align-top">
                            <SelectWithCreate
                              value={idOf(mapping?.phaseTemplate)}
                              onChange={(v) => handleChange(department, role, "phaseTemplate", v)}
                              items={phaseItems}
                              createLabel="Create new phase template"
                              onCreate={() => navigate("/admin/milestones/create-template")}
                              disabled={isPending}
                            />
                          </td>
                          <td className="py-3 align-top">
                            <SelectWithCreate
                              value={idOf(mapping?.leavePolicy)}
                              onChange={(v) => handleChange(department, role, "leavePolicy", v)}
                              items={leaveItems}
                              createLabel="Create new leave policy"
                              onCreate={() => navigate("/admin/leave-policies")}
                              disabled={isPending}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
};

export default RoleTemplatesMatrixPage;
