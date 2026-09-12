import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Building2, ChevronRight, Trash2, Pencil } from "lucide-react";
import {
  useGetDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/services/api/department.api";
import type { IDepartment } from "@/types/department.type";

const DepartmentsPage = () => {
  const navigate = useNavigate();
  const { data: departments, isLoading } = useGetDepartments();
  const { mutate: createDepartment, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDepartment, isPending: isUpdating } = useUpdateDepartment();
  const { mutate: deleteDepartment } = useDeleteDepartment();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IDepartment | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setDialogOpen(true);
  };

  const openEdit = (dept: IDepartment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editing) {
      updateDepartment(
        { id: editing._id, name, description },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createDepartment(
        { name, description },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const activeDepartments = (departments || []).filter((d) => d.status === "active");

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <TitleHeader
          title="Departments"
          description="Manage departments and the roles within each"
          link="/admin/dashboard"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Department
        </Button>
      </div>

      {!isLoading && activeDepartments.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3" />
          No departments yet. Create one to start organizing roles, contracts, and phase
          templates.
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeDepartments.map((dept) => (
          <Card
            key={dept._id}
            className="p-5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/admin/departments/${dept._id}`)}
          >
            <CardContent className="p-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{dept.name}</h3>
                </div>
                <Badge variant="outline">{dept.status}</Badge>
              </div>
              {dept.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{dept.description}</p>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(e) => openEdit(dept, e)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDepartment(dept._id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "New Department"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Engineering" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || isCreating || isUpdating}>
              {editing ? "Save Changes" : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default DepartmentsPage;
