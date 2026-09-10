import TitleHeader from "@/components/layout/TitleHeader";
import { useState } from "react";
import { Plus, Search, User, Building, Calendar, Eye, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import type { IContractTemplateBase } from "@/types/contract.type";

const ContractPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<IContractTemplateBase | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<IContractTemplateBase | null>(null);

  //   API CALLS
  const { data: contractsData } = useGetContractTemplates();
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const filteredContracts = contractsData?.items?.filter((contract: IContractTemplateBase) => {
    return (
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeleteClick = (contract: IContractTemplateBase) => {
    setContractToDelete(contract);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contractToDelete) {
      deleteContract(contractToDelete._id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setContractToDelete(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  return (
    <main className="min-h-screen  p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="Contract Templates"
          description="Manage contracts and agreements for all employees"
          link="/admin/dashboard"
        />
        <Button onClick={() => navigate("/admin/contract/create")} className="w-fit">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts?.map((contract: IContractTemplateBase) => (
          <Card key={contract._id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{contract.title}</h3>
                <p className="text-sm text-muted-foreground">{contract.companyName}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{contract?.createdBy?.username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(contract?.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedContract(contract)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedContract?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedContract && (
                      <ContractDocumentPreview
                        content={selectedContract.content}
                        layout={selectedContract.layout}
                        mode="template"
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={() => navigate(`edit/${contract._id}`)}>
                  <Edit2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteClick(contract)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredContracts?.length === 0 && (
        <Card className="p-12 text-center">
          <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No contract templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search" : "Create your first contract template to get started"}
          </p>
          <Button onClick={() => navigate("/admin/contract/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contract Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{contractToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
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

export default ContractPage;
