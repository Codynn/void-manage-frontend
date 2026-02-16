import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetTaskById, useUpdateTask } from "@/services/api/checklist.api";
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

const roles = ["intern", "mentor", "admin"];

const EditTaskPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mandatory, setMandatory] = useState(true);
  const [role, setRole] = useState("");

  const { data: taskData, isLoading: isFetching } = useGetTaskById(taskId || "");
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(); // Changed isLoading to isPending

  useEffect(() => {
    if (taskData) {
      setName(taskData.name);
      setDescription(taskData.description || "");
      setMandatory(taskData.mandatory);
      setRole(taskData.role);
    }
  }, [taskData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskId) {
      toast.error("Task ID is missing");
      return;
    }

    if (!role) {
      toast.error("Role is required");
      return;
    }

    updateTask(
      { taskId, name, description, mandatory, role }, // taskId is now guaranteed to be string
      {
        onSuccess: () => {
          navigate("/admin/milestones");
        },
      }
    );
  };

  if (isFetching) return <div>Loading task...</div>;

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Daily Task</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Name */}
        <div>
          <label className="mb-1 block text-sm font-medium">Task Name *</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="mb-1 block text-sm font-medium">Assign to Role *</label>
          <Select onValueChange={setRole} value={role}>
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

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional task description"
          />
        </div>

        {/* Mandatory */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mandatory}
            onChange={e => setMandatory(e.target.checked)}
            id="mandatory"
          />
          <label htmlFor="mandatory" className="text-sm">
            Mandatory
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/milestones")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Task"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTaskPage;
