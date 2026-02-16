import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";

interface Checkpoint {
  name: string;
  isCompleted: boolean;
}

interface CheckpointsListProps {
  checkpoints: Checkpoint[];
  milestoneId: string;
  onCheckpointChange: (milestoneId: string, checkpointIndex: number, isCompleted: boolean) => void;
}

const CheckpointsList = ({
  checkpoints,
  milestoneId,
  onCheckpointChange,
}: CheckpointsListProps) => {
  return (
    <Card className="bg-background border-border p-0">
      <CardContent className="p-4">
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Checkpoints</Label>
          {checkpoints.map((checkpoint, checkIndex) => (
            <div
              key={checkIndex}
              className="flex items-center justify-between p-2 bg-muted rounded"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`${milestoneId}-${checkIndex}`}
                  checked={checkpoint.isCompleted}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  onChange={(e) => {
                    onCheckpointChange(milestoneId, checkIndex, e.target.checked);
                  }}
                />
                <label
                  htmlFor={`${milestoneId}-${checkIndex}`}
                  className="text-foreground text-sm cursor-pointer"
                >
                  {checkpoint.name}
                </label>
              </div>
              <Badge
                variant="outline"
                className={`border-border text-xs ${
                  checkpoint.isCompleted
                    ? "bg-green-100 text-green-800 border-green-300"
                    : ""
                }`}
              >
                {checkpoint.isCompleted ? "Completed" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckpointsList;
