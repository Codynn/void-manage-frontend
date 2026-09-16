import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, LoaderCircle, FileSignature, ListChecks, CalendarDays } from "lucide-react";
import { useCreateUser } from "@/services/api/user.api";
import { useGetDepartments, useGetDepartmentById } from "@/services/api/department.api";
import { useGetContractTemplates } from "@/services/api/contract.api";
import { useGetPhaseTemplates } from "@/services/api/milestone.api";
import { useGetLeavePolicies } from "@/services/api/leavePolicy.api";
import SelectWithCreate, { NONE_SENTINEL as NONE } from "@/components/common/SelectWithCreate";

const idOf = (value: any): string => {
  if (!value) return NONE;
  return typeof value === "object" ? value._id : value;
};

const AddUserDialog = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    role: "INTERN",
  });
  const [departmentId, setDepartmentId] = useState<string>(NONE);
  const [contractTemplate, setContractTemplate] = useState(NONE);
  const [phaseTemplate, setPhaseTemplate] = useState(NONE);
  const [leavePolicy, setLeavePolicy] = useState(NONE);

  const createUserMutation = useCreateUser();
  const { data: departments } = useGetDepartments();
  const { data: department } = useGetDepartmentById(departmentId !== NONE ? departmentId : undefined);
  const { data: contractTemplates } = useGetContractTemplates();
  const { data: phaseTemplates } = useGetPhaseTemplates();
  const { data: leavePolicies } = useGetLeavePolicies();

  // Preload the department + role's configured defaults whenever either
  // changes, so the admin sees exactly what will be auto-assigned - and can
  // still override any of the three before creating the user.
  useEffect(() => {
    if (!department) {
      setContractTemplate(NONE);
      setPhaseTemplate(NONE);
      setLeavePolicy(NONE);
      return;
    }
    const mapping = department.roleTemplates?.find((rt) => rt.role === formData.role);
    setContractTemplate(idOf(mapping?.contractTemplate));
    setPhaseTemplate(idOf(mapping?.phaseTemplate));
    setLeavePolicy(idOf(mapping?.leavePolicy));
  }, [department, formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.username || !formData.role) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        ...formData,
        department: departmentId !== NONE ? departmentId : undefined,
        contractTemplate: contractTemplate !== NONE ? contractTemplate : null,
        phaseTemplate: phaseTemplate !== NONE ? phaseTemplate : null,
        leavePolicy: leavePolicy !== NONE ? leavePolicy : null,
      });
      setOpen(false);
      setFormData({
        email: "",
        username: "",
        role: "INTERN",
      });
      setDepartmentId(NONE);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            A temporary password will be generated and emailed to them along with a link to the dashboard.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERN">Intern</SelectItem>
                <SelectItem value="MENTOR">Mentor</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {departments?.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-md border p-3">
            <p className="text-xs text-muted-foreground">
              {departmentId !== NONE
                ? "Preloaded from this department's role defaults - change any of these before creating the user."
                : "Pick a department to preload defaults, or choose these directly."}
            </p>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <FileSignature className="h-3.5 w-3.5" />
                Contract Template
              </div>
              <SelectWithCreate
                value={contractTemplate}
                onChange={setContractTemplate}
                items={(contractTemplates?.items || []).map((c: any) => ({ _id: c._id, label: c.title }))}
                createLabel="Create new contract template"
                onCreate={() => navigate("/admin/contract/create")}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <ListChecks className="h-3.5 w-3.5" />
                Phase Template
              </div>
              <SelectWithCreate
                value={phaseTemplate}
                onChange={setPhaseTemplate}
                items={(phaseTemplates || []).map((p: any) => ({ _id: p._id, label: p.name }))}
                createLabel="Create new phase template"
                onCreate={() => navigate("/admin/milestones/create-template")}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <CalendarDays className="h-3.5 w-3.5" />
                Leave Policy
              </div>
              <SelectWithCreate
                value={leavePolicy}
                onChange={setLeavePolicy}
                items={(leavePolicies || []).map((p) => ({ _id: p._id, label: p.name }))}
                createLabel="Create new leave policy"
                onCreate={() => navigate("/admin/leave-policies")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
