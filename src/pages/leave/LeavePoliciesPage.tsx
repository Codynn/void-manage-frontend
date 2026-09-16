import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, CalendarDays, Trash2, Pencil } from "lucide-react";
import {
  useGetLeavePolicies,
  useCreateLeavePolicy,
  useUpdateLeavePolicy,
  useDeleteLeavePolicy,
} from "@/services/api/leavePolicy.api";
import { LEAVE_TYPE_LABELS, LEAVE_TYPES, type LeaveType } from "@/types/leave.type";
import type { ILeavePolicy, ILeavePolicyLeave } from "@/types/leavePolicy.type";

const ALL_LEAVE_TYPES = Object.keys(LEAVE_TYPES) as LeaveType[];

const LeavePoliciesPage = () => {
  const { data: policies, isLoading } = useGetLeavePolicies();
  const { mutate: createPolicy, isPending: isCreating } = useCreateLeavePolicy();
  const { mutate: updatePolicy, isPending: isUpdating } = useUpdateLeavePolicy();
  const { mutate: deletePolicy } = useDeleteLeavePolicy();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ILeavePolicy | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leaves, setLeaves] = useState<Record<LeaveType, number | null>>(
    {} as Record<LeaveType, number | null>
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setLeaves({} as Record<LeaveType, number | null>);
    setDialogOpen(true);
  };

  const openEdit = (policy: ILeavePolicy) => {
    setEditing(policy);
    setName(policy.name);
    setDescription(policy.description || "");
    const next = {} as Record<LeaveType, number | null>;
    policy.leaves.forEach((l) => {
      next[l.leaveType] = l.totalLeavesAvailable;
    });
    setLeaves(next);
    setDialogOpen(true);
  };

  const toggleLeaveType = (type: LeaveType) => {
    setLeaves((prev) => {
      const next = { ...prev };
      if (next[type] != null) delete next[type];
      else next[type] = 1;
      return next;
    });
  };

  const setLeaveDays = (type: LeaveType, days: number) => {
    setLeaves((prev) => ({ ...prev, [type]: days }));
  };

  const buildLeaves = (): ILeavePolicyLeave[] =>
    Object.entries(leaves)
      .filter(([, days]) => days != null)
      .map(([leaveType, days]) => ({
        leaveType: leaveType as LeaveType,
        totalLeavesAvailable: days as number,
      }));

  const handleSubmit = () => {
    const leavesPayload = buildLeaves();
    if (!name.trim() || leavesPayload.length === 0) return;

    if (editing) {
      updatePolicy(
        { id: editing._id, name, description, leaves: leavesPayload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createPolicy(
        { name, description, leaves: leavesPayload },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const isSaving = isCreating || isUpdating;

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <TitleHeader
          title="Leave Policies"
          description="Define which leave types + how many days each policy grants, then attach them to departments and roles"
          link="/admin/dashboard"
        />
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Leave Policy
        </Button>
      </div>

      {!isLoading && !policies?.length && (
        <Card className="p-12 text-center text-muted-foreground">
          <CalendarDays className="h-10 w-10 mx-auto mb-3" />
          No leave policies yet. Create one, then attach it to a department + role on the
          Department page so new users get it automatically.
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies?.map((policy) => (
          <Card key={policy._id} className="p-5">
            <CardContent className="p-0 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{policy.name}</h3>
                </div>
                <Badge variant="outline">{policy.leaves.length} leave types</Badge>
              </div>
              {policy.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{policy.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {policy.leaves.map((l) => (
                  <Badge key={l.leaveType} variant="secondary" className="text-xs font-normal">
                    {LEAVE_TYPE_LABELS[l.leaveType]}: {l.totalLeavesAvailable}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-1 pt-2 border-t">
                <Button variant="ghost" size="icon" onClick={() => openEdit(policy)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => deletePolicy(policy._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Leave Policy" : "New Leave Policy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Standard Intern Leave Policy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Leave Types & Days *</label>
              <div className="space-y-2 max-h-72 overflow-y-auto rounded-md border p-3">
                {ALL_LEAVE_TYPES.map((type) => {
                  const enabled = leaves[type] != null;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <Checkbox checked={enabled} onCheckedChange={() => toggleLeaveType(type)} />
                      <Label
                        className="flex-1 cursor-pointer text-sm font-normal"
                        onClick={() => toggleLeaveType(type)}
                      >
                        {LEAVE_TYPE_LABELS[type]}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        disabled={!enabled}
                        value={enabled ? leaves[type] ?? "" : ""}
                        onChange={(e) => setLeaveDays(type, Number(e.target.value))}
                        className="w-20 h-8"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || buildLeaves().length === 0 || isSaving}
            >
              {editing ? "Save Changes" : "Create Leave Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default LeavePoliciesPage;
