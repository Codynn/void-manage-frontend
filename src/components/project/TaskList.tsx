import { Calendar, User, Edit, TrendingUp, CheckCircle, XCircle, AlertCircle, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskListProps {
  tasks: any[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  getStatusColor: (status: string) => string;
  onEditTask: (task: any) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskList = ({ tasks, onStatusChange, getStatusColor, onEditTask, onDeleteTask }: TaskListProps) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
      case "in progress":
        return <Clock className="h-4 w-4" />;
      case "blocked":
      case "on_hold":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString.trim() === '') {
      return "No date";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return format(date, "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  // Helper function to get username from assignedTo field
  const getAssignedUsername = (assignedTo: any): string => {
    if (typeof assignedTo === 'string') {
      return assignedTo; // fallback to ID if username not available
    }
    return assignedTo?.username || assignedTo?.name || 'Unknown User';
  };

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-3">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="font-medium">No tasks yet</h4>
          <p className="text-sm text-muted-foreground">Create the first task to get started.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task: any) => (
        <Card key={task._id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{task.title}</h4>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1">{task.status}</span>
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{getAssignedUsername(task.assignedTo)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {task.timeline ? 
                      `${formatDate(task.timeline.start)} - ${formatDate(task.timeline.end)}` : 
                      "No timeline set"
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={task.status}
                onValueChange={(value) => onStatusChange(task._id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEditTask(task)}
              >
                <Edit className="h-3 w-3" />
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDeleteTask(task._id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
