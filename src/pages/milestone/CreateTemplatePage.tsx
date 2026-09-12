import {
  useCreatePhaseTemplate,
  useGetPhaseTemplateById,
  useUpdatePhaseTemplate,
} from "@/services/api/milestone.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Save, ArrowLeft, Sparkles } from "lucide-react";
import type { TPhaseTemplateForm, IPhase } from "@/types/milestone.type";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const CreateTemplatePage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const goBack = () => navigate(returnTo || "/admin/milestones/templates");
  const isEditMode = !!templateId;

  const [draggedPhaseIndex, setDraggedPhaseIndex] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TPhaseTemplateForm>({
    defaultValues: {
      name: "",
      isOnboarding: false,
      phases: [
        {
          name: "",
          description: "",
          order: 1,
          checkpoints: [{ title: "", description: "" }],
        },
      ],
    },
  });

  const {
    fields: phaseFields,
    append: appendPhase,
    remove: removePhase,
    move: movePhase,
  } = useFieldArray({
    control,
    name: "phases",
  });

  // API calls
  const { mutate: createTemplate, isPending: isCreating } = useCreatePhaseTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdatePhaseTemplate();
  const { data: templateData, isLoading: isLoadingTemplate } = useGetPhaseTemplateById(
    templateId || ""
  );

  // Load template data for editing
  useEffect(() => {
    if (isEditMode && templateData?.data) {
      const template = templateData.data;
      reset({
        name: template.name,
        isOnboarding: template.isOnboarding || false,
        phases: template.phases.map((phase: IPhase, index: number) => ({
          ...phase,
          order: index + 1,
          checkpoints:
            phase.checkpoints.length > 0 ? phase.checkpoints : [{ title: "", description: "" }],
        })),
      });
    }
  }, [templateData, isEditMode, reset]);

  const onSubmit = (data: TPhaseTemplateForm) => {
    // Update order for all phases based on their position
    const orderedData = {
      ...data,
      phases: data.phases.map((phase, index) => ({
        ...phase,
        order: index + 1,
        checkpoints: phase.checkpoints.filter(
          checkpoint => checkpoint.title.trim() !== "" || checkpoint?.description?.trim() !== ""
        ),
      })),
    };

    if (isEditMode) {
      updateTemplate(
        { id: templateId!, data: orderedData },
        {
          onSuccess: () => {
            goBack();
          },
        }
      );
    } else {
      createTemplate(orderedData, {
        onSuccess: () => {
          goBack();
        },
      });
    }
  };

  const addPhase = () => {
    const newOrder = phaseFields.length + 1;
    appendPhase({
      name: "",
      description: "",
      order: newOrder,

      checkpoints: [{ title: "", description: "" }],
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhaseIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedPhaseIndex !== null && draggedPhaseIndex !== dropIndex) {
      movePhase(draggedPhaseIndex, dropIndex);
    }
    setDraggedPhaseIndex(null);
  };

  if (isLoadingTemplate) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl container mx-auto p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Edit Phase Template" : "Create Phase Template"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Name */}
        <Card>
          <CardHeader>
            <CardTitle>Template Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Template Name *
              </label>
              <Input
                id="name"
                {...register("name", { required: "Template name is required" })}
                placeholder="e.g., Frontend Intern Phase"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <Controller
              name="isOnboarding"
              control={control}
              render={({ field }) => (
                <div className="mt-4 flex items-start gap-2 rounded-lg border bg-muted/40 p-3">
                  <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                  <div className="cursor-pointer" onClick={() => field.onChange(!field.value)}>
                    <Label className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Use as the onboarding template
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Automatically assigned to every new user and shown as their onboarding
                      progress on the dashboard. Only one template can be the onboarding template.
                    </p>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        {/* Phases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Phases</h2>
            <Button type="button" onClick={addPhase} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Phase
            </Button>
          </div>

          {phaseFields.map((phase, phaseIndex) => (
            <PhaseCard
              key={phase.id}
              phaseIndex={phaseIndex}
              control={control}
              register={register}
              errors={errors}
              removePhase={removePhase}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedPhaseIndex === phaseIndex}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => goBack()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isCreating || isUpdating}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isCreating || isUpdating
              ? "Saving..."
              : isEditMode
                ? "Update Template"
                : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
};

interface PhaseCardProps {
  phaseIndex: number;
  control: any;
  register: any;
  errors: any;
  removePhase: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
}

const PhaseCard = ({
  phaseIndex,
  control,
  register,
  errors,
  removePhase,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
}: PhaseCardProps) => {
  const {
    fields: checkpointFields,
    append: appendCheckpoint,
    remove: removeCheckpoint,
  } = useFieldArray({
    control,
    name: `phases.${phaseIndex}.checkpoints`,
  });

  const addCheckpoint = () => {
    appendCheckpoint({ title: "", description: "" });
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isDragging ? "scale-95 opacity-50" : "scale-100 opacity-100"
      }`}
      draggable
      onDragStart={e => onDragStart(e, phaseIndex)}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, phaseIndex)}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <GripVertical className="h-5 w-5 cursor-grab text-gray-400" />
        <CardTitle className="flex-1">Phase {phaseIndex + 1}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removePhase(phaseIndex)}
          className="text-destructive hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase Name */}
        <div>
          <label className="mb-2 block text-sm font-medium">Phase Name *</label>
          <Input
            {...register(`phases.${phaseIndex}.name`, {
              required: "Phase name is required",
            })}
            placeholder="e.g., HTML Fundamentals"
          />
          {errors.phases?.[phaseIndex]?.name && (
            <p className="mt-1 text-sm text-destructive">
              {errors.phases[phaseIndex].name.message}
            </p>
          )}
        </div>

        {/* Phase Description */}
        <div>
          <label className="mb-2 block text-sm font-medium">Phase Description *</label>
          <Textarea
            {...register(`phases.${phaseIndex}.description`, {
              required: "Phase description is required",
            })}
            placeholder="Describe what this phase covers..."
            rows={2}
          />
          {errors.phases?.[phaseIndex]?.description && (
            <p className="mt-1 text-sm text-destructive">
              {errors.phases[phaseIndex].description.message}
            </p>
          )}
        </div>

        {/* Checkpoints */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-medium">Checkpoints</label>
            <Button type="button" onClick={addCheckpoint} variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              Add Checkpoint
            </Button>
          </div>

          <div className="space-y-3">
            {checkpointFields.map((checkpoint, checkpointIndex) => (
              <div key={checkpoint.id} className="rounded-lg border bg-gray-50 p-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Input
                        {...register(`phases.${phaseIndex}.checkpoints.${checkpointIndex}.title`)}
                        placeholder="Checkpoint title..."
                      />
                    </div>
                    <div>
                      <Textarea
                        {...register(
                          `phases.${phaseIndex}.checkpoints.${checkpointIndex}.description`
                        )}
                        placeholder="Checkpoint description..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCheckpoint(checkpointIndex)}
                    className="mt-1 text-destructive hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateTemplatePage;
