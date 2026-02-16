import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdatePhase } from "@/services/api/milestone.api";
import type { IUserPhase } from "@/types/milestone.type";

export const useMilestoneUpdates = (userData: { _id: string }, phases: IUserPhase[]) => {
  const queryClient = useQueryClient();
  const [localCheckpointState, setLocalCheckpointState] = useState<Record<string, boolean>>({});
  const [savingPhases, setSavingPhases] = useState<Set<string>>(new Set());
  const updatePhaseMutation = useUpdatePhase();

  const handleLocalCheckpointChange = (
    phaseId: string,
    checkpointIndex: number,
    isCompleted: boolean
  ) => {
    const key = `${phaseId}-${checkpointIndex}`;
    setLocalCheckpointState((prev) => ({
      ...prev,
      [key]: isCompleted,
    }));
  };

  const getCheckpointStatus = (
    phaseId: string,
    checkpointIndex: number,
    originalStatus: string
  ) => {
    const key = `${phaseId}-${checkpointIndex}`;
    if (localCheckpointState.hasOwnProperty(key)) {
      return localCheckpointState[key] ? "completed" : "pending";
    }
    return originalStatus;
  };

  const handleSaveProgress = async (phaseId: string) => {
    setSavingPhases(prev => new Set(prev).add(phaseId));
    
    // Find the specific phase to update
    const phaseToUpdate = phases.find(phase => phase._id === phaseId);
    
    if (!phaseToUpdate) {
      console.error("Phase not found");
      setSavingPhases(prev => {
        const newSet = new Set(prev);
        newSet.delete(phaseId);
        return newSet;
      });
      return;
    }

    // Check if this phase has any changes
    const hasChanges = phaseToUpdate.checkpoints.some((_, index) => {
      const key = `${phaseId}-${index}`;
      return localCheckpointState.hasOwnProperty(key);
    });

    if (!hasChanges) {
      setSavingPhases(prev => {
        const newSet = new Set(prev);
        newSet.delete(phaseId);
        return newSet;
      });
      return;
    }

    // Prepare updated phase data with checkpoint changes
    const updatedCheckpoints = phaseToUpdate.checkpoints.map((checkpoint, index) => {
      const key = `${phaseId}-${index}`;
      if (localCheckpointState.hasOwnProperty(key)) {
        return {
          ...checkpoint,
          status: localCheckpointState[key] ? "completed" : "pending"
        };
      }
      return checkpoint;
    });

    const updatedPhase = {
      ...phaseToUpdate,
      checkpoints: updatedCheckpoints
    };

    // Store current local state for potential rollback
    const currentLocalState = { ...localCheckpointState };

    try {
      // Optimistically update the cache before making the API call
      queryClient.setQueryData(
        ["phases", "intern", userData._id],
        (oldData: any) => {
          if (!oldData?.data?.items) return oldData;
          
          const updatedItems = oldData.data.items.map((phase: any) => {
            if (phase._id === phaseId) {
              return updatedPhase;
            }
            return phase;
          });

          return {
            ...oldData,
            data: {
              ...oldData.data,
              items: updatedItems
            }
          };
        }
      );

      // Clear local state for this phase immediately
      const newLocalState = { ...localCheckpointState };
      phaseToUpdate.checkpoints.forEach((_, index) => {
        const key = `${phaseId}-${index}`;
        delete newLocalState[key];
      });
      setLocalCheckpointState(newLocalState);

      // Send the single updated phase directly
      await updatePhaseMutation.mutateAsync(updatedPhase);

    } catch (error) {
      console.error("Failed to save progress:", error);
      
      // Revert optimistic update on error
      queryClient.invalidateQueries({
        queryKey: ["phases", "intern", userData._id],
      });
      
      // Restore local state on error
      setLocalCheckpointState(currentLocalState);
    } finally {
      setSavingPhases(prev => {
        const newSet = new Set(prev);
        newSet.delete(phaseId);
        return newSet;
      });
    }
  };

  const hasUnsavedChanges = (phaseId: string, checkpointCount: number) => {
    for (let index = 0; index < checkpointCount; index++) {
      const key = `${phaseId}-${index}`;
      if (localCheckpointState.hasOwnProperty(key)) {
        return true;
      }
    }
    return false;
  };

  const isPhaseIdSaving = (phaseId: string) => {
    return savingPhases.has(phaseId);
  };

  return {
    localCheckpointState,
    isPhaseIdSaving,
    handleLocalCheckpointChange,
    getCheckpointStatus,
    handleSaveProgress,
    hasUnsavedChanges,
  };
};
