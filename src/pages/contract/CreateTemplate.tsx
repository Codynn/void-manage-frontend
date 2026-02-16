import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { Plus, X, LoaderCircle } from "lucide-react";
import { useParams } from "react-router-dom";
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
  useCreateContract,
  useGetContractTemplateById,
  useUpdateContract,
} from "@/services/api/contract.api";

// Types for contract template
interface TContractForm {
  title: string;
  terms: string[];
  tools: string[];
  totalDurationHours: number;
  mode: "remote" | "onsite" | "hybrid";
  companyName: string;
  description?: string;
}

const CreateTemplate = () => {
  const params = useParams<{ id?: string }>();
  const isEdit = !!params.id;

  const [terms, setTerms] = useState<string[]>([]);
  const [newTerm, setNewTerm] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TContractForm>({
    defaultValues: {
      title: "",
      terms: [],
      tools: [],
      totalDurationHours: 0,
      mode: "remote",
      companyName: "",
      description: "",
    },
  });

  //   API CALLS

  const { mutate: createTemplate, isPending } = useCreateContract();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateContract();
  const { data: contractData } = useGetContractTemplateById(params.id);

  useEffect(() => {
    if (isEdit && contractData) {
      reset({
        title: contractData.title,
        terms: contractData.terms,
        tools: contractData.tools,
        totalDurationHours: contractData.totalDurationHours,
        mode: contractData.mode,
        companyName: contractData.companyName,
        description: contractData.description || "",
      });
      setTerms(contractData.terms || []);
      setTools(contractData.tools || []);
    }
  }, [isEdit, contractData, reset]); // Reset form when contract data changes

  const addTerm = () => {
    if (newTerm.trim() && !terms.includes(newTerm.trim())) {
      setTerms([...terms, newTerm.trim()]);
      setNewTerm("");
    }
  };

  const removeTerm = (term: string) => {
    setTerms(terms.filter((t) => t !== term));
  };

  const addTool = () => {
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
      setNewTool("");
    }
  };

  const removeTool = (tool: string) => {
    setTools(tools.filter((t) => t !== tool));
  };

  const onSubmit = (data: TContractForm) => {
    if (isPending || isUpdating) return;

    if (isEdit) {
      updateTemplate({
        ...data,
        terms,
        tools,
        _id: params.id,
      });
      return;
    }

    const contractData = {
      ...data,
      terms,
      tools,
    };

    createTemplate(contractData, {
      onSuccess: () => {
        reset();
        setTerms([]);
        setTools([]);
        setNewTerm("");
        setNewTool("");
      },
    });
  };

  return (
    <main className="min-h-screen  p-6 max-w-4xl mx-auto space-y-6">
      <TitleHeader
        title={
          isEdit ? "Edit Contract Template" : "Create New Contract Template"
        }
        description="Set up a contract template with terms, conditions, and project details"
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
                  htmlFor="title"
                  className="text-sm font-medium text-foreground"
                >
                  Contract Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="title"
                  placeholder="e.g., Mobile App Development Contract"
                  {...register("title", {
                    required: "Contract title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters",
                    },
                  })}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="companyName"
                  className="text-sm font-medium text-foreground"
                >
                  Company Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="companyName"
                  placeholder="e.g., Tech Innovators Ltd."
                  {...register("companyName", {
                    required: "Company name is required",
                  })}
                  className={errors.companyName ? "border-destructive" : ""}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">
                    {errors.companyName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Brief description of the contract scope and objectives"
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                {...register("description")}
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Project Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="totalDurationHours"
                  className="text-sm font-medium text-foreground"
                >
                  Total Duration (Hours){" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id="totalDurationHours"
                  type="number"
                  min="1"
                  placeholder="e.g., 250"
                  {...register("totalDurationHours", {
                    required: "Duration is required",
                    min: {
                      value: 1,
                      message: "Duration must be at least 1 hour",
                    },
                    valueAsNumber: true,
                  })}
                  className={
                    errors.totalDurationHours ? "border-destructive" : ""
                  }
                />
                {errors.totalDurationHours && (
                  <p className="text-sm text-destructive">
                    {errors.totalDurationHours.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="mode"
                  className="text-sm font-medium text-foreground"
                >
                  Work Mode <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="mode"
                  control={control}
                  rules={{ required: "Work mode is required" }}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger
                        className={
                          (errors.mode ? "border-destructive" : "") + " w-full"
                        }
                      >
                        <SelectValue placeholder="Select work mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="onsite">Onsite</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mode && (
                  <p className="text-sm text-destructive">
                    {errors.mode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contract Terms */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Contract Terms & Conditions
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a contract term (e.g., The app must be delivered within 3 months)"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTerm())
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTerm}
                  disabled={!newTerm.trim()}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {terms.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="flex-1 text-sm">{term}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTerm(term)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {terms.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No terms added yet. Add contract terms and conditions above.
                </p>
              )}
            </div>
          </div>

          {/* Tools & Technologies */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2">
              Tools & Technologies
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology/tool (e.g., Flutter, Firebase, GraphQL)"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTool())
                  }
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTool}
                  disabled={!newTool.trim()}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <Badge key={tool} variant="secondary" className="px-3 py-1">
                    {tool}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => removeTool(tool)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {tools.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No tools added yet. Add technologies and tools that will be
                  used.
                </p>
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
                setTerms([]);
                setTools([]);
                setNewTerm("");
                setNewTool("");
              }}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[120px]"
            >
              {isEdit ? "Update Contract" : "Create Contract"}
              {isPending && (
                <LoaderCircle className="h-4 w-4 ml-2 animate-spin" />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
};

export default CreateTemplate;
