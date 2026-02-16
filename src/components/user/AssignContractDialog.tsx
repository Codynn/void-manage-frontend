
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetContractTemplates, useCreateAssignContract } from "@/services/api/contract.api";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface AssignContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

export const AssignContractDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
}: AssignContractDialogProps) => {
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  
  const { data: contractTemplates, isLoading } = useGetContractTemplates();
  const { mutate: assignContract, isPending } = useCreateAssignContract();

  const handleAssign = () => {
    if (!selectedContractId) {
      toast.error("Please select a contract");
      return;
    }

    assignContract(
      {
        contractId: selectedContractId,
        assignedTo: userId,
      },
      {
        onSuccess: () => {
          toast.success("Contract assigned successfully");
          onOpenChange(false);
          setSelectedContractId("");
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to assign contract");
        },
      }
    );
  };

  const selectedContract = contractTemplates?.items?.find(
    (contract: any) => contract._id === selectedContractId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Contract</DialogTitle>
          <DialogDescription>
            Assign an internship contract to {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Select Contract Template</Label>
            <Select value={selectedContractId} onValueChange={setSelectedContractId}>
              <SelectTrigger id="contract">
                <SelectValue placeholder="Choose a contract template" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading contracts...
                  </SelectItem>
                ) : contractTemplates?.items?.length > 0 ? (
                  contractTemplates.items.map((contract: any) => (
                    <SelectItem key={contract._id} value={contract._id}>
                      {contract.title} - {contract.companyName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No contracts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedContract && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{selectedContract.title}</h4>
                  <p className="text-xs text-gray-600">{selectedContract.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Duration</p>
                  <p className="font-medium">{selectedContract.totalDurationHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Mode</p>
                  <p className="font-medium capitalize">{selectedContract.mode}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-600 text-xs mb-2">Tools & Technologies</p>
                <div className="flex flex-wrap gap-1">
                  {selectedContract.tools?.map((tool: string) => (
                    <Badge key={tool} variant="outline" className="text-xs capitalize">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-gray-600 text-xs mb-2">Terms ({selectedContract.terms?.length || 0})</p>
                <div className="space-y-1">
                  {selectedContract.terms?.slice(0, 2).map((term: string, index: number) => (
                    <p key={index} className="text-xs text-gray-700">
                      • {term}
                    </p>
                  ))}
                  {selectedContract.terms?.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{selectedContract.terms.length - 2} more terms
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedContractId || isPending}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Contract"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
