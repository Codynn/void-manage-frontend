import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Briefcase, FileSignature, ListChecks, Trash2, Pencil } from "lucide-react";
import {
  useGetDepartmentById,
  useGetDepartmentRoles,
  useCreateDepartmentRole,
  useUpdateDepartmentRole,
  useDeleteDepartmentRole,
} from "@/services/api/department.api";
import { useGetContractTemplates } from "@/services/api/contract.api";
import { useGetPhaseTemplates } from "@/services/api/milestone.api";
import type { IDepartmentRole } from "@/types/department.type";

const NONE = "__none__";

const DepartmentDetailPage = () => {
  const { departmentId } = useParams();

  const { data: department } = useGetDepartmentById(departmentId);
  const { data: roles, isLoading } = useGetDepartmentRoles(departmentId);
  const { data: contractTemplates } = useGetContractTemplates();
  const { data: phaseTemplates } = useGetPhaseTemplates();

  const { mutate: createRole, isPending: isCreating } = useCreateDepartmentRole();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateDepartmentRole();
  const { mutate: deleteRole } = useDeleteDepartmentRole();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IDepartmentRole | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contractTemplate, setContractTemplate] = useState<string>(NONE);
  const [phaseTemplate, setPhaseTemplate] = useState<string>(NONE);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setContractTemplate(NONE);
    setPhaseTemplate(NONE);
    setDialogOpen(true);
  };

  const openEdit = (role: IDepartmentRole) => {
    setEditing(role);
    setTitle(role.title);
    setDescription(role.description || "");
    setContractTemplate(
      typeof role.contractTemplate === "object" && role.contractTemplate
        ? role.contractTemplate._id
        : (role.contractTemplate as string) || NONE
    );
    setPhaseTemplate(
      typeof role.phaseTemplate === "object" && role.phaseTemplate
        ? role.phaseTemplate._id
        : (role.phaseTemplate as string) || NONE
    );
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!title.trim() || !departmentId) return;
    const payload = {
      title,
      description,
      contractTemplate: contractTemplate === NONE ? null : contractTemplate,
      phaseTemplate: phaseTemplate === NONE ? null : phaseTemplate,
    };
    if (editing) {
      updateRole({ id: editing._id, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createRole({ department: departmentId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const activeRoles = (roles || []).filter((r) => r.status === "active");

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <TitleHeader
          title={department?.name || "Department"}
          description={department?.description || "Manage roles for this department"}
          link="/admin/departments"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {!isLoading && activeRoles.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Briefcase className="h-10 w-10 mx-auto mb-3" />
          No roles in this department yet. Add one and attach a contract and phase template so
          new hires get set up automatically.
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRoles.map((role) => (
          <Card key={role._id} className="p-5">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{role.title}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(role)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => deleteRole(role._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {role.description && (
                <p className="text-sm text-muted-foreground">{role.description}</p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="gap-1">
                  <FileSignature className="h-3 w-3" />
                  {typeof role.contractTemplate === "object" && role.contractTemplate
                    ? role.contractTemplate.title
                    : "No contract"}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <ListChecks className="h-3 w-3" />
                  {typeof role.phaseTemplate === "object" && role.phaseTemplate
                    ? role.phaseTemplate.name
                    : "No phase template"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., React Intern" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Contract Template</label>
                <Link
                  to={`/admin/contract/create?returnTo=/admin/departments/${departmentId}`}
                  className="text-xs text-primary hover:underline"
                  onClick={() => setDialogOpen(false)}
                >
                  + Create new
                </Link>
              </div>
              <Select value={contractTemplate} onValueChange={setContractTemplate}>
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Phase Template</label>
                <Link
                  to={`/admin/milestones/create-template?returnTo=/admin/departments/${departmentId}`}
                  className="text-xs text-primary hover:underline"
                  onClick={() => setDialogOpen(false)}
                >
                  + Create new
                </Link>
              </div>
              <Select value={phaseTemplate} onValueChange={setPhaseTemplate}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || isCreating || isUpdating}>
              {editing ? "Save Changes" : "Add Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default DepartmentDetailPage;
