import {
  useGetPhaseTemplates,
  useDeletePhaseTemplate,
} from "@/services/api/milestone.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { IPhaseTemplate } from "@/types/milestone.type";
import { useNavigate } from "react-router-dom";
import { useGetUserData } from "@/services/api/user.api";

const TemplatesListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: userData } = useGetUserData();
  const { data: templatesData, isLoading, refetch } = useGetPhaseTemplates();
  const { mutate: deleteTemplate, isPending: isDeleting } =
    useDeletePhaseTemplate();

  const templates = templatesData || [];

  const filteredTemplates = templates.filter((template: IPhaseTemplate) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${templateName}"? This action cannot be undone.`
      )
    ) {
      deleteTemplate(templateId, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleViewTemplate = (templateId: string) => {
    navigate(
      `/${
        userData?.role === "ADMIN" ? "admin" : "mentor"
      }/milestones/templates/${templateId}`
    );
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(
      `/${
        userData?.role === "ADMIN" ? "admin" : "mentor"
      }/milestones/edit-template/${templateId}`
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

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phase Templates</h1>
          <p className="text-gray-600 mt-1">
            Manage your internship phase templates
          </p>
        </div>
        {userData?.role === "ADMIN" && (
          <Button
            onClick={() => navigate("/admin/milestones/create-template")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Badge
          variant="outline"
          className="flex items-center bg-background gap-1"
        >
          <Filter className="w-3 h-3" />
          {filteredTemplates.length} template
          {filteredTemplates.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <div>
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <div>
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates yet
              </h3>
              {userData?.role === "ADMIN" && (
                <>
                  <p className="text-gray-600 mb-4">
                    Create your first phase template to get started
                  </p>
                  <Button
                    onClick={() =>
                      navigate("/admin/milestones/create-template")
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((template: IPhaseTemplate) => (
            <Card
              key={template._id}
              className="hover:shadow-md transition-shadow duration-200 cursor-pointer gap-0"
              onClick={() => handleViewTemplate(template._id!)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 mr-2">
                    {template.name}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {template.phases.length} phase
                    {template.phases.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Phase Preview */}
                  <div className="space-y-2">
                    {template.phases.slice(0, 3).map((phase, index) => (
                      <div key={index} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-700 truncate">
                            {phase.name}
                          </span>
                        </div>
                        {phase.checkpoints.length > 0 && (
                          <div className="ml-7 text-xs text-gray-500">
                            {phase.checkpoints.length} checkpoint
                            {phase.checkpoints.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    ))}

                    {template.phases.length > 3 && (
                      <div className="text-xs text-gray-500 ml-7">
                        +{template.phases.length - 3} more phase
                        {template.phases.length - 3 !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 pb-0 mt-auto border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTemplate(template._id!);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      {userData?.role === "ADMIN" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTemplate(template._id!);
                          }}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template._id!, template.name);
                      }}
                      disabled={isDeleting}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

export default TemplatesListPage;
