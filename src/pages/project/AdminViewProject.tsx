import { useParams } from "react-router-dom";
import {
  useGetProjectById,
  useChangeTaskStatus,
} from "@/services/api/project.api";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { TeamMembers } from "@/components/project/TeamMembers";
import { ProjectStats } from "@/components/project/ProjectStats";
import { TaskSection } from "@/components/project/TaskSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const AdminViewProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projectId } = useParams();

  const { data: projectData, isLoading: projectLoading } =
    useGetProjectById(projectId);
  const changeTaskStatusMutation = useChangeTaskStatus();

  const project = projectData?.project;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "assigned":
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "in_progress":
      case "in progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "on_hold":
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    changeTaskStatusMutation.mutate(
      { taskId, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["project", projectId],
          });
        },
      }
    );
  };

  if (projectLoading) {
    return (
      <main className="p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="p-6 space-y-6">
        <Card className="p-12 text-center">
          <h3 className="text-lg font-semibold mb-2">Project not found</h3>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <ProjectHeader project={project} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectOverview project={project} getStatusColor={getStatusColor} />

          <TaskSection
            projectId={projectId!}
            tasks={project.tasks || []}
            assignedUsers={project.assignedUsers || []}
            onStatusChange={handleStatusChange}
            getStatusColor={getStatusColor}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProjectStats tasks={project.tasks || []} />

          <TeamMembers assignedUsers={project.assignedUsers || []} />
        </div>
      </div>
    </main>
  );
};

export default AdminViewProject;
