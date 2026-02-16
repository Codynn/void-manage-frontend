import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAssignTaskToIntern,
  useAssignTaskToMentor,
  useAssignableInterns,
  useAssignableMentors,
} from "@/services/api/checklist.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const AssignTaskPage = () => {
  const navigate = useNavigate();
  const [assignType, setAssignType] = useState<"intern" | "mentor">("intern");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mandatory, setMandatory] = useState(true);
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data: interns = [], isLoading: loadingInterns } = useAssignableInterns();
  const { data: mentors = [], isLoading: loadingMentors } = useAssignableMentors();

  const assignToIntern = useAssignTaskToIntern();
  const assignToMentor = useAssignTaskToMentor();

  const assignees = assignType === "intern" ? interns : mentors;
  const isLoadingAssignees = assignType === "intern" ? loadingInterns : loadingMentors;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !assigneeId) {
      toast.error("Task name and assignee are required");
      return;
    }

    const taskData = {
      name,
      description,
      mandatory,
      dueDate: dueDate || undefined,
    };

    if (assignType === "intern") {
      assignToIntern.mutate(
        { ...taskData, internId: assigneeId },
        {
          onSuccess: () => {
            navigate(-1);
          },
        }
      );
    } else {
      assignToMentor.mutate(
        { ...taskData, mentorId: assigneeId },
        {
          onSuccess: () => {
            navigate(-1);
          },
        }
      );
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-bold">Assign Task</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Assign to *</label>
          <Select
            value={assignType}
            onValueChange={(value: "intern" | "mentor") => {
              setAssignType(value);
              setAssigneeId("");
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="intern">Intern</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Select {assignType === "intern" ? "Intern" : "Mentor"} *
          </label>
          <Select value={assigneeId} onValueChange={setAssigneeId} disabled={isLoadingAssignees}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${assignType}`} />
            </SelectTrigger>
            <SelectContent>
              {assignees.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">No {assignType}s available</div>
              ) : (
                assignees.map((person: any) => (
                  <SelectItem key={person._id} value={person._id}>
                    {person.username} ({person.email})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Task Name *</label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter task name"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Optional task description"
            rows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Due Date</label>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        </div>

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

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={assignToIntern.isPending || assignToMentor.isPending}>
            {assignToIntern.isPending || assignToMentor.isPending ? "Assigning..." : "Assign Task"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AssignTaskPage;
