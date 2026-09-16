import TitleHeader from "@/components/layout/TitleHeader";
import { useState } from "react";
import { Plus, Search, User, Calendar, Eye, Edit2, Trash2, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useGetContractTemplates, useDeleteContract } from "@/services/api/contract.api";
import {
  useGetCertificateTemplates,
  useDeleteCertificateTemplate,
} from "@/services/api/certificate.api";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import ContractPagesPreview from "@/components/contract/ContractPagesPreview";
import type { JSONContent } from "@tiptap/react";
import type { ContractLayout } from "@/components/contract/LetterheadCanvas";

type TemplateTab = "contract" | "completion" | "recommendation";

interface UnifiedTemplate {
  _id: string;
  title: string;
  companyName: string;
  // Contracts are multi-page; certificates are single-page.
  pages?: { content: JSONContent; layout: ContractLayout }[];
  content?: JSONContent;
  layout?: ContractLayout;
  createdAt: string;
  createdBy?: { username?: string };
}

const TAB_CONFIG: Record<
  TemplateTab,
  { label: string; createHref: string; editHrefBase: string }
> = {
  contract: {
    label: "Contracts",
    createHref: "/admin/contract/create",
    editHrefBase: "/admin/contract/edit",
  },
  completion: {
    label: "Completion Certificates",
    createHref: "/admin/certificates/create?type=completion",
    editHrefBase: "/admin/certificates/edit",
  },
  recommendation: {
    label: "Letters of Recommendation",
    createHref: "/admin/certificates/create?type=recommendation",
    editHrefBase: "/admin/certificates/edit",
  },
};

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TemplateTab>("contract");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<UnifiedTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<UnifiedTemplate | null>(null);

  //   API CALLS
  const { data: contractsData } = useGetContractTemplates();
  const { data: certificatesData } = useGetCertificateTemplates(
    activeTab === "contract" ? undefined : activeTab
  );
  const { mutate: deleteContract, isPending: isDeletingContract } = useDeleteContract();
  const { mutate: deleteCertificateTemplate, isPending: isDeletingCertificate } =
    useDeleteCertificateTemplate();

  const isDeleting = isDeletingContract || isDeletingCertificate;

  const templates: UnifiedTemplate[] =
    activeTab === "contract" ? contractsData?.items || [] : certificatesData?.items || [];

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (template: UnifiedTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!templateToDelete) return;
    const onSuccess = () => {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    };
    if (activeTab === "contract") {
      deleteContract(templateToDelete._id, { onSuccess });
    } else {
      deleteCertificateTemplate(templateToDelete._id, { onSuccess });
    }
  };

  const config = TAB_CONFIG[activeTab];

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="Templates"
          description="Manage contract, completion certificate, and recommendation letter templates"
          link="/admin/dashboard"
        />
        <Button onClick={() => navigate(config.createHref)} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateTab)}>
        <TabsList>
          <TabsTrigger value="contract">Contracts</TabsTrigger>
          <TabsTrigger value="completion">Completion Certificates</TabsTrigger>
          <TabsTrigger value="recommendation">Letters of Recommendation</TabsTrigger>
        </TabsList>

        <Card className="p-6 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">{template.companyName}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{template?.createdBy?.username}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(template?.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{selectedTemplate?.title}</DialogTitle>
                        </DialogHeader>
                        {selectedTemplate && selectedTemplate.pages ? (
                          <ContractPagesPreview pages={selectedTemplate.pages} mode="template" />
                        ) : selectedTemplate ? (
                          <ContractDocumentPreview
                            content={selectedTemplate.content ?? null}
                            layout={selectedTemplate.layout}
                            mode="template"
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`${config.editHrefBase}/${template._id}`)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteClick(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card className="p-12 text-center">
              <FileStack className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search"
                  : `Create your first ${config.label.toLowerCase()} template to get started`}
              </p>
              <Button onClick={() => navigate(config.createHref)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{templateToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default TemplatesPage;
