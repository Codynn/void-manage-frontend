import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import TitleHeader from "@/components/layout/TitleHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, ShieldCheck, GraduationCap, FileSignature, ListChecks } from "lucide-react";
import {
  useGetDepartmentById,
  useUpdateDepartmentRoleTemplate,
} from "@/services/api/department.api";
import { useGetContractTemplates } from "@/services/api/contract.api";
import { useGetPhaseTemplates } from "@/services/api/milestone.api";
import type { SystemRole } from "@/types/department.type";

const NONE = "__none__";

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
}: {
  departmentId: string;
  role: SystemRole;
  currentContractId: string;
  currentPhaseId: string;
}) => {
  const { data: contractTemplates } = useGetContractTemplates();
  const { data: phaseTemplates } = useGetPhaseTemplates();
  const { mutate: updateRoleTemplate, isPending } = useUpdateDepartmentRoleTemplate();

  const [contractTemplate, setContractTemplate] = useState(currentContractId);
  const [phaseTemplate, setPhaseTemplate] = useState(currentPhaseId);

  useEffect(() => setContractTemplate(currentContractId), [currentContractId]);
  useEffect(() => setPhaseTemplate(currentPhaseId), [currentPhaseId]);

  const Icon = ROLE_META[role].icon;

  const handleChange = (field: "contractTemplate" | "phaseTemplate", value: string) => {
    const nextContractTemplate = field === "contractTemplate" ? value : contractTemplate;
    const nextPhaseTemplate = field === "phaseTemplate" ? value : phaseTemplate;

    setContractTemplate(nextContractTemplate);
    setPhaseTemplate(nextPhaseTemplate);

    updateRoleTemplate({
      departmentId,
      role,
      contractTemplate: nextContractTemplate === NONE ? null : nextContractTemplate,
      phaseTemplate: nextPhaseTemplate === NONE ? null : nextPhaseTemplate,
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
          <Select
            value={contractTemplate}
            onValueChange={(v) => handleChange("contractTemplate", v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {contractTemplates?.items?.map((c: any) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <ListChecks className="h-3.5 w-3.5" />
            Phase Template
          </div>
          <Select
            value={phaseTemplate}
            onValueChange={(v) => handleChange("phaseTemplate", v)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {phaseTemplates?.map((p: any) => (
                <SelectItem key={p._id} value={p._id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        </Link>
        , then attach them here.
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
