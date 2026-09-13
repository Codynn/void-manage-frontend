import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, LoaderCircle } from "lucide-react";
import { useGetDepartments, useUpdateDepartmentRoleTemplate } from "@/services/api/department.api";
import type { SystemRole } from "@/types/department.type";

interface BulkApplyTemplateCardProps {
  templateId: string;
}

const ROLES: SystemRole[] = ["INTERN", "MENTOR", "ADMIN"];

const BulkApplyTemplateCard = ({ templateId }: BulkApplyTemplateCardProps) => {
  const { data: departments } = useGetDepartments();
  const [departmentId, setDepartmentId] = useState<string>("");
  const [role, setRole] = useState<SystemRole>("INTERN");

  const { mutate: updateRoleTemplate, isPending } = useUpdateDepartmentRoleTemplate();

  const selectedDepartment = useMemo(
    () => departments?.find((d) => d._id === departmentId),
    [departments, departmentId]
  );
  const existingContractTemplate = selectedDepartment?.roleTemplates.find(
    (rt) => rt.role === role
  )?.contractTemplate;

  const handleApply = () => {
    if (!departmentId) return;
    updateRoleTemplate({
      departmentId,
      role,
      phaseTemplate: templateId,
      contractTemplate:
        typeof existingContractTemplate === "string"
          ? existingContractTemplate
          : existingContractTemplate?._id ?? null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Set as Department Phase Template
        </CardTitle>
        <CardDescription>
          Connect this template to a department + role, so every new user created there with that
          role is auto-assigned this template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="max-w-xs flex-1 space-y-1.5">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-w-xs flex-1 space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as SystemRole)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" onClick={handleApply} disabled={!departmentId || isPending} className="gap-2">
          {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Set as {role} Phase Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkApplyTemplateCard;
