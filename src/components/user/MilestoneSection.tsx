import {
  useGetPhasesByInternId,
  useGetPhaseTemplates,
  useAssignPhaseTemplate,
} from "@/services/api/milestone.api";
import type { IUserData } from "@/types/user.type";
import type { IUserPhase } from "@/types/milestone.type";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Flag } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MilestoneStats from "./MilestoneStats";
import MilestoneCard from "./MilestoneCard";
import AssignTemplateDialog from "./AssignTemplateDialog";
import { useMilestoneUpdates } from "./hooks/useMilestoneUpdates";

const MilestoneSection = ({ userData }: { userData: IUserData }) => {
  const queryClient = useQueryClient();
  const [assignTemplateOpen, setAssignTemplateOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const { data: phasesResponse, isLoading: phasesLoading } =
    useGetPhasesByInternId(userData?._id);

  const { data: templateResponse, isLoading: templatesLoading } =
    useGetPhaseTemplates();
  const assignTemplateMutation = useAssignPhaseTemplate();

  const phases: IUserPhase[] = phasesResponse?.data?.items || [];
  const templates = templateResponse || [];

  // Use the custom hook for milestone updates
  const {
    isPhaseIdSaving,
    handleLocalCheckpointChange,
    getCheckpointStatus,
    handleSaveProgress,
    hasUnsavedChanges,
  } = useMilestoneUpdates(userData, phases);

  // Transform phases data to match the desired milestone format
  const milestones = phases.map((phase) => {
    const checkpointsWithLocalState = phase.checkpoints.map((cp, index) => ({
      name: cp.title,
      isCompleted: getCheckpointStatus(phase._id, index, cp.status as string) === "completed",
    }));

    const completedCheckpoints = checkpointsWithLocalState.filter(
      (cp) => cp.isCompleted
    ).length;
    const completionRate =
      phase.checkpoints.length > 0
        ? Math.round((completedCheckpoints / phase.checkpoints.length) * 100)
        : 0;

    return {
      id: phase._id,
      phase: phase.name,
      days: `${phase.order * 30} days`, // Assuming 30 days per phase
      interns: [userData.username || userData.email], // Single intern for this user
      completionRate,
      checkpoints: checkpointsWithLocalState,
    };
  });

  const handleAssignTemplate = async () => {
    if (!selectedTemplateId || !userData._id) return;

    try {
      await assignTemplateMutation.mutateAsync({
        templateId: selectedTemplateId,
        userId: userData._id,
      });
      setAssignTemplateOpen(false);
      setSelectedTemplateId("");
      // Refetch the phases data
      queryClient.invalidateQueries({
        queryKey: ["phases", "intern", userData._id],
      });
    } catch (error) {
      console.error("Failed to assign template:", error);
    }
  };

  const getTotalCheckpoints = () => {
    return phases.reduce((total, phase) => total + phase.checkpoints.length, 0);
  };

  const getCompletedCheckpoints = () => {
    return phases.reduce(
      (total, phase) =>
        total +
        phase.checkpoints.filter((checkpoint) => checkpoint.status === "completed").length,
      0
    );
  };

  const getCompletedPhases = () => {
    return phases.filter((phase) => phase.status === "completed").length;
  };

  if (phasesLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="h-4 w-4 text-gray-600" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="h-4 w-4 text-gray-600" />
            Milestones
          </CardTitle>

          <AssignTemplateDialog
            open={assignTemplateOpen}
            onOpenChange={setAssignTemplateOpen}
            templates={templates}
            templatesLoading={templatesLoading}
            selectedTemplateId={selectedTemplateId}
            onTemplateChange={setSelectedTemplateId}
            onAssign={handleAssignTemplate}
            isAssigning={assignTemplateMutation.isPending}
            userName={userData.username}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <MilestoneStats
          completedPhases={getCompletedPhases()}
          totalPhases={phases.length}
          completedCheckpoints={getCompletedCheckpoints()}
          totalCheckpoints={getTotalCheckpoints()}
        />

        {/* Milestones List */}
        <div className="space-y-4">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onCheckpointChange={handleLocalCheckpointChange}
              onSaveProgress={handleSaveProgress}
              isSaving={isPhaseIdSaving(milestone.id)}
              hasUnsavedChanges={hasUnsavedChanges(milestone.id, milestone.checkpoints.length)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneSection;
