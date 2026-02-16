import { useState } from "react";
import {
  Plus,
  Calendar,
  Users,
  Code,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import TitleHeader from "@/components/layout/TitleHeader";
import { useGetProjects } from "@/services/api/project.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IProjectBase } from "@/types/project.type";
import ProjectCard from "../../components/project/ProjectCard";
import { ProjectSkeleton } from "@/components/skeletons/project-skeleton";
import { Link } from "react-router-dom";

const AdminProjectPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: projectsData, isLoading: projectsLoading } = useGetProjects();
  const projects = projectsData?.data?.projects || [];

  // Filter projects based on search and filters
  const filteredProjects = projects.filter((project: IProjectBase) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    const matchesType = typeFilter === "all" || project.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

 
  return (
    <main className="min-h-screen  p-6 max-w-7xl mx-auto space-y-6">
      <TitleHeader
        title="Project Management"
        description="Manage projects and tasks for all employees"
        link="/admin/dashboard"
      />

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-background">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-background">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="prototype">Prototype</SelectItem>
                <SelectItem value="research">Research</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Add Project Button */}
        <Link to ="create">
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Project
        </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {
                  projects.filter(
                    (p: IProjectBase) => p.status === "IN_PROGRESS"
                  ).length
                }
              </p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <Code className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">
                {
                  projects.filter((p: IProjectBase) => p.status === "COMPLETED")
                    .length
                }
              </p>
            </div>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
              <p className="text-2xl font-bold">
                {projects.length > 0
                  ? Math.round(
                      projects.reduce(
                        (acc: number, p: IProjectBase) => acc + p.progress,
                        0
                      ) / projects.length
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? `Filtered Projects (${filteredProjects.length})`
              : `All Projects (${projects.length})`}
          </h2>
        </div>

        {projectsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project: IProjectBase) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <div className="h-12 w-12 bg-muted rounded-lg mx-auto flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "No projects match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first project."}
              </p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add New Project
              </Button>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
};

export default AdminProjectPage;
