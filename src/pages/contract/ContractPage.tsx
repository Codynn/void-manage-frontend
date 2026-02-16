import TitleHeader from "@/components/layout/TitleHeader";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Building,
  Calendar,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { IContractTemplateBase } from "@/types/contract.type";



const ContractPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [selectedContract, setSelectedContract] =
    useState<IContractTemplateBase | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<IContractTemplateBase | null>(null);

  //   API CALLS
  const { data: contractsData } = useGetContractTemplates();
  const { mutate: deleteContract, isPending: isDeleting } = useDeleteContract();

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "remote":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "onsite":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "hybrid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const filteredContracts = contractsData?.items?.filter((contract: IContractTemplateBase) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter === "all" || contract.mode === modeFilter;

    return matchesSearch && matchesMode;
  });

  const getStats = () => {
    const total = contractsData?.items?.length;
    const remote = contractsData?.items?.filter(
      (c: IContractTemplateBase) => c.mode === "remote"
    )?.length;
    const onsite = contractsData?.items?.filter(
      (c: IContractTemplateBase) => c.mode === "onsite"
    )?.length;
    const hybrid = contractsData?.items?.filter(
      (c: IContractTemplateBase) => c.mode === "hybrid"
    )?.length;

    return { total, remote, onsite, hybrid };
  };

  const stats = getStats();

  // Delete handlers
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Templates</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.remote}</p>
              <p className="text-sm text-muted-foreground">Remote</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.hybrid}</p>
              <p className="text-sm text-muted-foreground">Hybrid</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.onsite}</p>
              <p className="text-sm text-muted-foreground">Onsite</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">Onsite</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts?.map((contract: IContractTemplateBase) => (
          <Card
            key={contract._id}
            className="p-6 hover:shadow-lg transition-shadow"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{contract.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {contract.companyName}
                  </p>
                </div>
                <Badge className={getModeColor(contract.mode)}>
                  {contract.mode}
                </Badge>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{contract.totalDurationHours} hours</span>
              </div>

              {/* Tools */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Technologies:</p>
                <div className="flex flex-wrap gap-1">
                  {contract?.tools?.slice(0, 3)?.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {contract?.tools?.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{contract?.tools?.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Created Info */}
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
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{selectedContract?.title}</DialogTitle>
                    </DialogHeader>
                    {selectedContract && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Company</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedContract.companyName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Mode</p>
                            <Badge
                              className={getModeColor(selectedContract.mode)}
                            >
                              {selectedContract.mode}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Duration</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedContract.totalDurationHours} hours
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Created</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(selectedContract.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">
                            Technologies
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedContract.tools.map((tool) => (
                              <Badge key={tool} variant="outline">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">
                            Contract Terms
                          </p>
                          <div className="space-y-2">
                            {selectedContract.terms.map((term, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <p className="text-sm">{term}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`edit/${contract._id}`)}
                >
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
          <h3 className="text-lg font-semibold mb-2">
            No contract templates found
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || modeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first contract template to get started"}
          </p>
          <Button onClick={() => navigate("/contracts/create")}>
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
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ContractPage;
