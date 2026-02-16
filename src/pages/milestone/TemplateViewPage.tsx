import {
  useGetPhaseTemplateById,
  useDeletePhaseTemplate,
} from "@/services/api/milestone.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { IPhaseTemplate, IPhase } from "@/types/milestone.type";
import { useGetUserData } from "@/services/api/user.api";

const TemplateViewPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams();

  const { data: userData } = useGetUserData();
  const { data: templateData, isLoading } = useGetPhaseTemplateById(
    templateId || ""
  );
  const { mutate: deleteTemplate, isPending: isDeleting } =
    useDeletePhaseTemplate();

  const template: IPhaseTemplate | null = templateData?.data || null;

  const handleDeleteTemplate = () => {
    if (!template) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${template.name}"? This action cannot be undone.`
      )
    ) {
      deleteTemplate(template._id!, {
        onSuccess: () => {
          navigate("/admin/milestones/templates");
        },
      });
    }
  };

  const handleEditTemplate = () => {
    navigate(`/admin/milestones/edit-template/${templateId}`);
  };

  const getTotalCheckpoints = () => {
    if (!template) return 0;
    return template.phases.reduce(
      (total, phase) => total + phase.checkpoints.length,
      0
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Template not found
          </h2>
          <p className="text-gray-600 mb-4">
            The template you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/admin/milestones/templates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {template.name}
            </h1>
            <p className="text-gray-600 mt-1">Template Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {userData?.role === "ADMIN" && (
            <Button
              variant="outline"
              onClick={handleEditTemplate}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Template
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDeleteTemplate}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Phases
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {template.phases.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Checkpoints
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTotalCheckpoints()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Checkpoints/Phase
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {template.phases.length > 0
                    ? Math.round(getTotalCheckpoints() / template.phases.length)
                    : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phases */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Phases</h2>
          <Badge variant="secondary" className="text-sm">
            {template.phases.length} phase
            {template.phases.length !== 1 ? "s" : ""} total
          </Badge>
        </div>

        <div className="space-y-6">
          {template.phases
            .sort((a, b) => a.order - b.order)
            .map((phase: IPhase, phaseIndex: number) => (
              <Card key={phaseIndex} className="overflow-hidden p-0  gap-0">
                <CardHeader className=" border-b [.border-b]:pb-2 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {phase.order}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900">
                        {phase.name}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{phase.description}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {phase.checkpoints.length} checkpoint
                      {phase.checkpoints.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {phase.checkpoints.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Checkpoints
                      </h4>

                      <div className="grid gap-4 md:grid-cols-2">
                        {phase.checkpoints.map(
                          (checkpoint, checkpointIndex) => (
                            <div
                              key={checkpointIndex}
                              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <Circle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-900 mb-1">
                                    {checkpoint.title ||
                                      `Checkpoint ${checkpointIndex + 1}`}
                                  </h5>
                                  {checkpoint.description && (
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {checkpoint.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No checkpoints defined for this phase</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      </section>

      {/* Actions Footer */}
      <div className="mt-8 pt-6 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              navigate(`/${userData?.role?.toLowerCase()}/milestones/templates`)
            }
          >
            Back to Templates
          </Button>
          <Button onClick={handleEditTemplate}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Template
          </Button>
        </div>
      </div>
    </main>
  );
};

export default TemplateViewPage;
