import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTask } from "@/services/api/checklist.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const roles = ["intern", "mentor", "admin"] as const;

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mandatory, setMandatory] = useState(true);
  const [role, setRole] = useState<"intern" | "mentor" | "admin" | "">("");

  const { mutate: createTask, isPending } = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      toast.error("Task name and role are required");
      return;
    }

    createTask(
      { name, description, mandatory, role },
      {
        onSuccess: () => navigate("/admin/milestones"),
      }
    );
  };

  return (
    <div className="max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-bold">Create Daily Task</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Task Name *</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Assign to Role *</label>
          <Select onValueChange={value => setRole(value as typeof roles[number])}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(r => (
                <SelectItem key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional task description"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mandatory}
            onChange={e => setMandatory(e.target.checked)}
            id="mandatory"
          />
          <label htmlFor="mandatory" className="text-sm">Mandatory</label>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/milestones")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
