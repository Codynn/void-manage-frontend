"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  Star,
  Target,
  Calendar,
  MessageSquare,
  User,
  CalendarDays,
} from "lucide-react";
import type { IUserPhase, ICheckpoint } from "@/types/milestone.type";
import { useUpdatePhase } from "@/services/api/milestone.api";
import {
  useUserChecklist,
  useUpdateTaskStatus,
  useUpdateIndividualTaskStatus
} from "@/services/api/checklist.api";
import toast from "react-hot-toast";

interface MilestoneTrackerProps {
  phases: IUserPhase[];
  isLoading?: boolean;
  onUpdate?: () => void;
}

export function MilestoneTracker({ phases, isLoading, onUpdate }: MilestoneTrackerProps) {
  const { data: checklistData, isLoading: checklistLoading, refetch } = useUserChecklist();
  const updateTaskStatus = useUpdateTaskStatus();
  const updateIndividualTaskStatus = useUpdateIndividualTaskStatus();

  const [roleBasedTasks, setRoleBasedTasks] = useState<any[]>([]);
  const [individualTasks, setIndividualTasks] = useState<any[]>([]);

  useEffect(() => {
    console.log(checklistData);
    if (checklistData && Array.isArray(checklistData)) {
      // Split the combined array back into role-based and individual
      const roleBased = checklistData.filter(task => task.type === 'role-based');
      const individual = checklistData.filter(task => task.type === 'individual');

      setRoleBasedTasks(roleBased);
      setIndividualTasks(individual);
    }
  }, [checklistData]);

  const handleToggleRoleBasedTask = (taskId: string, completed: boolean) => {
    setRoleBasedTasks(prev =>
      prev.map(task => (task._id === taskId ? { ...task, completed } : task))
    );

    updateTaskStatus.mutate(
      { taskId, completed },
      {
        onError: () => {
          setRoleBasedTasks(prev =>
            prev.map(task => (task._id === taskId ? { ...task, completed: !completed } : task))
          );
          toast.error("Failed to update task");
        },
        onSettled: () => refetch(),
      }
    );
  };

  const handleToggleIndividualTask = (taskId: string, completed: boolean) => {
    setIndividualTasks(prev =>
      prev.map(task => (task._id === taskId ? { ...task, completed } : task))
    );

    updateIndividualTaskStatus.mutate(
      { taskId, completed },
      {
        onError: () => {
          setIndividualTasks(prev =>
            prev.map(task => (task._id === taskId ? { ...task, completed: !completed } : task))
          );
          toast.error("Failed to update task");
        },
        onSettled: () => refetch(),
      }
    );
  };

  const [phaseCheckpoints, setPhaseCheckpoints] = useState<Record<string, ICheckpoint[]>>({});

  useEffect(() => {
    if (phases) {
      const initialCheckpoints: Record<string, ICheckpoint[]> = {};
      phases.forEach(phase => {
        initialCheckpoints[phase._id] = [...phase.checkpoints];
      });
      setPhaseCheckpoints(initialCheckpoints);
    }
  }, [phases]);

  const updatePhaseMutation = useUpdatePhase();

  const handleCheckpointChange = (
    phaseId: string,
    checkpointIndex: number,
    isCompleted: boolean
  ) => {
    setPhaseCheckpoints(prev => ({
      ...prev,
      [phaseId]:
        prev[phaseId]?.map((checkpoint, index) =>
          index === checkpointIndex
            ? { ...checkpoint, status: isCompleted ? "completed" : "pending" }
            : checkpoint
        ) || [],
    }));
  };

  const handleUpdatePhase = async (phase: IUserPhase) => {
    const updatedCheckpoints = phaseCheckpoints[phase._id] || phase.checkpoints;
    const updatedPhase = { ...phase, checkpoints: updatedCheckpoints };

    try {
      await updatePhaseMutation.mutateAsync(updatedPhase);
      toast.success("Phase updated successfully!");
      onUpdate?.();
    } catch {
      toast.error("Failed to update phase");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => (status === "completed" ? CheckCircle : Clock);

  const getPhaseStatus = (phase: IUserPhase) => {
    if (phase.isCompleted) return "completed";
    if (phase.status === "pending" && phase.progress > 0) return "in-progress";
    return phase.status;
  };

  const totalCheckpoints =
    phases?.reduce((sum, phase) => {
      const current = phaseCheckpoints[phase._id] || phase.checkpoints;
      return sum + current.length;
    }, 0) || 0;

  const completedCheckpoints =
    phases?.reduce((sum, phase) => {
      const current = phaseCheckpoints[phase._id] || phase.checkpoints;
      return sum + current.filter(cp => cp.status === "completed").length;
    }, 0) || 0;

  const overallProgress =
    totalCheckpoints > 0 ? (completedCheckpoints / totalCheckpoints) * 100 : 0;

  const currentPhase = phases?.find(phase => !phase.isCompleted) || phases?.[0];
  const completedPhases = phases?.filter(phase => phase.isCompleted).length || 0;

  if (isLoading || checklistLoading) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="bg-background p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Milestone Tracker</h1>
            <p className="text-muted-foreground">Track your internship progress and achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Overall Progress
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {Math.round(overallProgress)}%
              </div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Checkpoints</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {completedCheckpoints}/{totalCheckpoints}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Current Phase</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{currentPhase?.order || 1}</div>
              <p className="mt-2 text-xs text-muted-foreground">
                {currentPhase?.name || "Not Started"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                Phases Completed
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{completedPhases}</div>
              <p className="mt-2 text-xs text-muted-foreground">
                Out of {phases?.length || 0} phases
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare className="h-5 w-5" /> Daily Checklist
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Complete your daily tasks and requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleBasedTasks.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Daily Tasks</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {roleBasedTasks.map(item => (
                    <div
                      key={item._id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg bg-muted p-3"
                      onClick={() => handleToggleRoleBasedTask(item._id, !item.completed)}
                    >
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={`flex-1 ${item.completed ? "text-primary" : "text-foreground"}`}>
                        {item.name}
                      </span>
                      {item.mandatory && (
                        <Badge variant="outline" className="border-destructive text-xs text-destructive">
                          Required
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {individualTasks.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  Assigned Tasks
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {individualTasks.map(item => (
                    <div
                      key={item._id}
                      className="flex cursor-pointer flex-col gap-2 rounded-lg bg-muted p-3"
                      onClick={() => handleToggleIndividualTask(item._id, !item.completed)}
                    >
                      <div className="flex items-center gap-3">
                        {item.completed ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={`flex-1 ${item.completed ? "text-primary" : "text-foreground"}`}>
                          {item.name}
                        </span>
                        {item.mandatory && (
                          <Badge variant="outline" className="border-destructive text-xs text-destructive">
                            Required
                          </Badge>
                        )}
                      </div>
                      <div className="ml-8 flex items-center gap-4 text-xs text-muted-foreground">
                        {item.assignedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.assignedBy.name}
                          </span>
                        )}
                        {item.dueDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {roleBasedTasks.length === 0 && individualTasks.length === 0 && (
              <p className="text-center text-muted-foreground">No tasks available</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {phases?.map(phase => {
            const currentCheckpoints = phaseCheckpoints[phase._id] || phase.checkpoints;
            const phaseStatus = getPhaseStatus(phase);
            const StatusIcon = getStatusIcon(phaseStatus);
            const completedCount = currentCheckpoints.filter(
              cp => cp.status === "completed"
            ).length;
            const phaseProgress =
              currentCheckpoints.length > 0
                ? (completedCount / currentCheckpoints.length) * 100
                : 0;

            return (
              <Card key={phase._id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground">{phase.name}</CardTitle>
                      <Badge className={`${getStatusColor(phaseStatus)} text-white`}>
                        <StatusIcon className="mr-1 h-3 w-3" />{" "}
                        {phaseStatus.replace("-", " ").toUpperCase()}
                      </Badge>
                      <CardDescription className="text-muted-foreground">
                        Phase {phase.order} • {completedCount}/{currentCheckpoints.length} completed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <Progress value={phaseProgress} className="h-2" />
                  </div>
                  <div className="grid gap-2">
                    {currentCheckpoints.map((cp, index) => (
                      <div
                        key={cp._id || index}
                        className="flex cursor-pointer items-center gap-3 rounded bg-muted p-2 hover:bg-muted/80"
                        onClick={() =>
                          handleCheckpointChange(phase._id, index, cp.status !== "completed")
                        }
                      >
                        {cp.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={`${cp.status === "completed" ? "text-green-600 line-through" : "text-foreground"}`}
                        >
                          {cp.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleUpdatePhase(phase)}
                    disabled={updatePhaseMutation.isPending}
                    className="mt-2 bg-primary text-primary-foreground"
                  >
                    {updatePhaseMutation.isPending ? "Updating..." : "Update Phase"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}