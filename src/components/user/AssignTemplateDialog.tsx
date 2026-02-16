import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Plus, LoaderCircle } from "lucide-react";

interface Template {
  _id: string;
  name: string;
  phases: any[];
}

interface AssignTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: Template[];
  templatesLoading: boolean;
  selectedTemplateId: string;
  onTemplateChange: (templateId: string) => void;
  onAssign: () => void;
  isAssigning: boolean;
  userName: string;
}

const AssignTemplateDialog = ({
  open,
  onOpenChange,
  templates,
  templatesLoading,
  selectedTemplateId,
  onTemplateChange,
  onAssign,
  isAssigning,
  userName,
}: AssignTemplateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-3 w-3" />
          Assign Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Phase Template</DialogTitle>
          <DialogDescription>
            Select a phase template to assign to {userName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">Select Template</Label>
            <Select value={selectedTemplateId} onValueChange={onTemplateChange}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue
                  placeholder={
                    templatesLoading
                      ? "Loading templates..."
                      : "Choose a template"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {templatesLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                      Loading templates...
                    </div>
                  </SelectItem>
                ) : templates?.length === 0 ? (
                  <SelectItem value="empty" disabled>
                    No templates available
                  </SelectItem>
                ) : (
                  templates?.map((template) => {
                    const totalCheckpoints = template.phases.reduce(
                      (total: number, phase: any) =>
                        total + phase.checkpoints.length,
                      0
                    );
                    return (
                      <SelectItem key={template._id} value={template._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-gray-500">
                            {template.phases.length} phase
                            {template.phases.length !== 1 ? "s" : ""} •{" "}
                            {totalCheckpoints} checkpoint
                            {totalCheckpoints !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button onClick={onAssign} disabled={isAssigning || !selectedTemplateId}>
            {isAssigning ? (
              <>
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTemplateDialog;
