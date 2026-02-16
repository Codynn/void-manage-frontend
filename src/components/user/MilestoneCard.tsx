import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";
import CheckpointsList from "./CheckpointsList";

interface Checkpoint {
  name: string;
  isCompleted: boolean;
}

interface Milestone {
  id: string;
  phase: string;
  days: string;
  interns: string[];
  completionRate: number;
  checkpoints: Checkpoint[];
}

interface MilestoneCardProps {
  milestone: Milestone;
  onCheckpointChange: (milestoneId: string, checkpointIndex: number, isCompleted: boolean) => void;
  onSaveProgress: (milestoneId: string) => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const MilestoneCard = ({
  milestone,
  onCheckpointChange,
  onSaveProgress,
  isSaving,
  hasUnsavedChanges,
}: MilestoneCardProps) => {
  return (
    <Card className="bg-muted border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-foreground text-lg">
              {milestone.phase}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {milestone.days} • {milestone.interns.length} interns
            </CardDescription>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            {milestone.completionRate}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Overall Progress</span>
            <span className="text-muted-foreground">
              {milestone.completionRate}%
            </span>
          </div>
          <Progress value={milestone.completionRate} className="h-2" />
        </div>

        {/* Intern-specific milestone tracking */}
        <div className="space-y-3">
          <CheckpointsList
            checkpoints={milestone.checkpoints}
            milestoneId={milestone.id}
            onCheckpointChange={onCheckpointChange}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => onSaveProgress(milestone.id)}
            disabled={isSaving || !hasUnsavedChanges}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
