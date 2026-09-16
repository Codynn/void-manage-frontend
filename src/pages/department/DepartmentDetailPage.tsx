import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import TitleHeader from "@/components/layout/TitleHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SelectWithCreate, { NONE_SENTINEL as NONE } from "@/components/common/SelectWithCreate";
import { Users, ShieldCheck, GraduationCap, FileSignature, ListChecks, CalendarDays } from "lucide-react";
import {
  useGetDepartmentById,
  useUpdateDepartmentRoleTemplate,
} from "@/services/api/department.api";
import { useGetContractTemplates } from "@/services/api/contract.api";
import { useGetPhaseTemplates } from "@/services/api/milestone.api";
import { useGetLeavePolicies } from "@/services/api/leavePolicy.api";
import type { SystemRole } from "@/types/department.type";

const ROLE_META: Record<SystemRole, { label: string; icon: typeof Users }> = {
  INTERN: { label: "Intern", icon: GraduationCap },
  MENTOR: { label: "Mentor", icon: Users },
  ADMIN: { label: "Admin", icon: ShieldCheck },
};

const ROLES: SystemRole[] = ["INTERN", "MENTOR", "ADMIN"];

const RoleTemplateCard = ({
  departmentId,
  role,
  currentContractId,
  currentPhaseId,
  currentLeavePolicyId,
}: {
  departmentId: string;
  role: SystemRole;
  currentContractId: string;
  currentPhaseId: string;
  currentLeavePolicyId: string;
}) => {
  const navigate = useNavigate();
  const { data: contractTemplates } = useGetContractTemplates();
  const { data: phaseTemplates } = useGetPhaseTemplates();
  const { data: leavePolicies } = useGetLeavePolicies();
  const { mutate: updateRoleTemplate, isPending } = useUpdateDepartmentRoleTemplate();

  const [contractTemplate, setContractTemplate] = useState(currentContractId);
  const [phaseTemplate, setPhaseTemplate] = useState(currentPhaseId);
  const [leavePolicy, setLeavePolicy] = useState(currentLeavePolicyId);

  useEffect(() => setContractTemplate(currentContractId), [currentContractId]);
  useEffect(() => setPhaseTemplate(currentPhaseId), [currentPhaseId]);
  useEffect(() => setLeavePolicy(currentLeavePolicyId), [currentLeavePolicyId]);

  const Icon = ROLE_META[role].icon;

  const handleChange = (
    field: "contractTemplate" | "phaseTemplate" | "leavePolicy",
    value: string
  ) => {
    const nextContractTemplate = field === "contractTemplate" ? value : contractTemplate;
    const nextPhaseTemplate = field === "phaseTemplate" ? value : phaseTemplate;
    const nextLeavePolicy = field === "leavePolicy" ? value : leavePolicy;

    setContractTemplate(nextContractTemplate);
    setPhaseTemplate(nextPhaseTemplate);
    setLeavePolicy(nextLeavePolicy);

    updateRoleTemplate({
      departmentId,
      role,
      contractTemplate: nextContractTemplate === NONE ? null : nextContractTemplate,
      phaseTemplate: nextPhaseTemplate === NONE ? null : nextPhaseTemplate,
      leavePolicy: nextLeavePolicy === NONE ? null : nextLeavePolicy,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {ROLE_META[role].label}
        </CardTitle>
        <CardDescription>
          Auto-assigned to every new {ROLE_META[role].label.toLowerCase()} created in this
          department
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <FileSignature className="h-3.5 w-3.5" />
            Contract Template
          </div>
          <SelectWithCreate
            value={contractTemplate}
            onChange={(v) => handleChange("contractTemplate", v)}
            items={(contractTemplates?.items || []).map((c: any) => ({ _id: c._id, label: c.title }))}
            createLabel="Create new contract template"
            onCreate={() => navigate("/admin/contract/create")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <ListChecks className="h-3.5 w-3.5" />
            Phase Template
          </div>
          <SelectWithCreate
            value={phaseTemplate}
            onChange={(v) => handleChange("phaseTemplate", v)}
            items={(phaseTemplates || []).map((p: any) => ({ _id: p._id, label: p.name }))}
            createLabel="Create new phase template"
            onCreate={() => navigate("/admin/milestones/create-template")}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <CalendarDays className="h-3.5 w-3.5" />
            Leave Policy
          </div>
          <SelectWithCreate
            value={leavePolicy}
            onChange={(v) => handleChange("leavePolicy", v)}
            items={(leavePolicies || []).map((p) => ({ _id: p._id, label: p.name }))}
            createLabel="Create new leave policy"
            onCreate={() => navigate("/admin/leave-policies")}
            disabled={isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const DepartmentDetailPage = () => {
  const { departmentId } = useParams();
  const { data: department } = useGetDepartmentById(departmentId);

  const templateIdOf = (value: any): string => {
    if (!value) return NONE;
    return typeof value === "object" ? value._id : value;
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title={department?.name || "Department"}
        description={
          department?.description ||
          "Configure which contract and phase template gets auto-assigned per role"
        }
        link="/admin/departments"
      />

      <p className="text-sm text-muted-foreground">
        Roles come from the system's Admin / Mentor / Intern roles. Manage templates on the{" "}
        <Link to="/admin/templates" className="text-primary hover:underline">
          Templates page
        </Link>{" "}
        and leave policies on the{" "}
        <Link to="/admin/leave-policies" className="text-primary hover:underline">
          Leave Policies page
        </Link>
        , then attach them here. Configuring many departments at once? Use the{" "}
        <Link to="/admin/role-templates" className="text-primary hover:underline">
          Role Templates matrix
        </Link>{" "}
        instead.
      </p>

      {departmentId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROLES.map((role) => {
            const mapping = department?.roleTemplates?.find((rt) => rt.role === role);
            return (
              <RoleTemplateCard
                key={role}
                departmentId={departmentId}
                role={role}
                currentContractId={templateIdOf(mapping?.contractTemplate)}
                currentPhaseId={templateIdOf(mapping?.phaseTemplate)}
                currentLeavePolicyId={templateIdOf(mapping?.leavePolicy)}
              />
            );
          })}
        </div>
      )}

      {!department?.roleTemplates?.length && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          No templates configured yet - new users in this department won't get anything
          auto-assigned until you pick one above.
        </Badge>
      )}
    </main>
  );
};

export default DepartmentDetailPage;
