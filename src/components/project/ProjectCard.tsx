import { Card } from "@/components/ui/card";
import type { IProjectBase } from "@/types/project.type";
import { TrendingUp, Code, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, getStatusColor, getTypeColor } from "@/lib/project.utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ProjectCard = ({ project }: { project: IProjectBase }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {project.name}
          </h3>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline" className={getTypeColor(project.type)}>
              {project.type}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>{project.progress?.toFixed(2)}%</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {project.description}
      </p>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{project.progress?.toFixed(2) }%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(project.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Technologies */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Code className="h-4 w-4" />
          <span>Technologies</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.technologies.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
          {project.technologies.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{project.technologies.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Timeline</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">
            {formatDate(project.timeline.start)} -{" "}
            {formatDate(project.timeline.end)}
          </span>
        </div>
      </div>

      {/* Assigned Users */}
      <div className="space-y-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Team ({project.assignedUsers.length})</span>
        </div>
        <div className="space-y-1">
          {project.assignedUsers.length > 0 ? (
            project.assignedUsers.slice(0, 2).map((user) => (
              <div key={user._id} className="text-sm">
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground ml-1">
                  ({user.email})
                </span>
              </div>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No users assigned
            </span>
          )}
          {project.assignedUsers.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{project.assignedUsers.length - 2} more members
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Link to={project?._id}>
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
        </Link>
        <Link to={`edit/${project?._id}`}>
          <Button variant="outline" size="sm" className="flex-1">
            Edit Project
          </Button>
        </Link>
      </div>
    </div>
  </Card>
);

export default ProjectCard;
