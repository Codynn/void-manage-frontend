import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Plus, X, LoaderCircle } from "lucide-react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DatePicker,
  formatDateToString,
  parseDateString,
} from "@/components/ui/date-picker";
import {
  useCreateProject,
  useGetProjectById,
  useUpdateProject,
} from "@/services/api/project.api";
import type { TProjectForm } from "@/types/project.type";
import { useGetUsers } from "@/services/api/user.api";
import { useParams } from "react-router-dom";
import type { IUserData } from "@/types/user.type";

const CreateProject = () => {
  const params = useParams<{ projectId?: string }>();

  const isEdit = !!params.projectId;
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  const { mutate: createProject, isPending: isSubmitting } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { data: projectData } = useGetProjectById(params.projectId);
  const { data: usersData, isLoading: userLoading } = useGetUsers(); // Assuming you have a hook to fetch users

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm<TProjectForm>({
    defaultValues: {
      name: "",
      type: "major",
      description: "",
      technologies: [],
      assignedUsers: [],
      tasks: [],
      timeline: {
        start: "",
        end: "",
      },
    },
  });

  useEffect(() => {
    if (isEdit && projectData) {
      const project = projectData?.project;
      reset({
        name: project.name,
        type: project.type,
        description: project.description,
        technologies: project.technologies || [],
        assignedUsers: project.assignedUsers || [],
        timeline: {
          start: project.timeline?.start
            ? formatDateToString(new Date(project.timeline.start))
            : "",
          end: project.timeline?.end
            ? formatDateToString(new Date(project.timeline.end))
            : "",
        },
      });
      setTechnologies(project.technologies || []);
      setAssignedUsers(
        project.assignedUsers?.map((u: IUserData) => u._id) || []
      );
    }
  }, [isEdit, projectData, reset]);

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()]);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const removeUser = (userId: string) => {
    setAssignedUsers(assignedUsers.filter((u) => u !== userId));
  };

  const onSubmit = (data: TProjectForm) => {
    if (isSubmitting || isUpdating) return;

    if (isEdit) {
      const postData = {
        ...projectData,
        ...data,
        technologies,
        assignedUsers,
      };

      updateProject({ projectId: params.projectId, projectData: postData });

      return;
    }

    const postData = {
      ...data,
      technologies,
      assignedUsers,
    };

    createProject(postData as any, {
      onSuccess: () => {
        // Reset form
        reset();
        setTechnologies([]);
        setAssignedUsers([]);
        setNewTech("");
      },
    });
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title={isEdit ? "Edit Project" : "Create New Project"}
        description="Set up a project with timeline, technologies, and team assignments"
      />

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  {...register("name", {
                    required: "Project name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  })}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="text-sm font-medium text-foreground"
                >
                  Project Type <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Project type is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        className={
                          (errors.type ? "border-destructive" : "") + "w-full"
                        }
                      >
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="major">Major Project</SelectItem>
                        <SelectItem value="minor">Minor Project</SelectItem>
                        <SelectItem value="prototype">Prototype</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="description"
                placeholder="Describe the project objectives, scope, and key deliverables"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...register("description", {
                  required: "Project description is required",
                  minLength: {
                    value: 20,
                    message: "Description must be at least 20 characters",
                  },
                })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Project Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="start"
                  className="text-sm font-medium text-foreground"
                >
                  Start Date <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="timeline.start"
                  control={control}
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <DatePicker
                      date={
                        field.value ? parseDateString(field.value) : undefined
                      }
                      onDateChange={(date) => {
                        field.onChange(date ? formatDateToString(date) : "");
                      }}
                      placeholder="Select start date"
                      className={
                        errors.timeline?.start ? "border-destructive" : ""
                      }
                    />
                  )}
                />
                {errors.timeline?.start && (
                  <p className="text-sm text-destructive">
                    {errors.timeline.start.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="end"
                  className="text-sm font-medium text-foreground"
                >
                  End Date <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="timeline.end"
                  control={control}
                  rules={{
                    required: "End date is required",
                    validate: (value) => {
                      const startDate = watch("timeline.start");
                      if (
                        startDate &&
                        value &&
                        new Date(value) <= new Date(startDate)
                      ) {
                        return "End date must be after start date";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      date={
                        field.value ? parseDateString(field.value) : undefined
                      }
                      onDateChange={(date) => {
                        field.onChange(date ? formatDateToString(date) : "");
                      }}
                      placeholder="Select end date"
                      className={
                        errors.timeline?.end ? "border-destructive" : ""
                      }
                    />
                  )}
                />
                {errors.timeline?.end && (
                  <p className="text-sm text-destructive">
                    {errors.timeline.end.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Technologies & Stack
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology (e.g., React, Node.js, MongoDB)"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTechnology())
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTechnology}
                  disabled={!newTech.trim()}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1">
                    {tech}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTechnology(tech)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {technologies.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No technologies added yet. Add some technologies that will be
                  used in this project.
                </p>
              )}
            </div>
          </div>

          {/* Assigned Users */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Team Assignment
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Select
                  value=""
                  onValueChange={(userId) => {
                    if (userId && !assignedUsers.includes(userId)) {
                      setAssignedUsers([...assignedUsers, userId]);
                    }
                  }}
                  disabled={userLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        userLoading
                          ? "Loading users..."
                          : "Select a team member to add"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.items?.map((user: IUserData) => (
                      <SelectItem
                        key={user?._id}
                        value={user?._id}
                        disabled={assignedUsers.includes(user?._id)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{user?.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                    {!userLoading &&
                      (!usersData?.items || usersData.items.length === 0) && (
                        <SelectItem value="" disabled>
                          No users available
                        </SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-2">
                {assignedUsers?.map((userId) => {
                  const user = usersData?.items?.find(
                    (u: any) => u._id === userId
                  );
                  return (
                    <Badge key={userId} variant="outline" className="px-3 py-1">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {user ? user.username : userId}
                          </span>
                          {user && (
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => removeUser(userId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </Badge>
                  );
                })}
              </div>

              {assignedUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No team members assigned yet. Select users from the dropdown
                  to assign them to this project.
                </p>
              )}

              {assignedUsers.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{assignedUsers.length}</span>{" "}
                  team member{assignedUsers.length !== 1 ? "s" : ""} assigned
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setTechnologies([]);
                setAssignedUsers([]);
                setNewTech("");
              }}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUpdating}
              className="min-w-[120px]"
            >
              {isEdit ? "Update Project" : "Create Project"}

              {(isSubmitting || isUpdating) && (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
};

export default CreateProject;
