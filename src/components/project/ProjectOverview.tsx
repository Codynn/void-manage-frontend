import { Calendar, Code, Edit } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ProjectOverviewProps {
  project: any;
  getStatusColor: (status: string) => string;
}

export const ProjectOverview = ({ project, getStatusColor }: ProjectOverviewProps) => {
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

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline">
                {project.type}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/admin/project/edit/${project._id}`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          {/* Progress */}*\          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Progress</h3>
              <span className="text-sm text-muted-foreground">{project.progress?.toFixed(2)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(project.progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(project.timeline.start)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(project.timeline.end)}</p>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Technologies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
