import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetContractTemplates, useCreateAssignContract } from "@/services/api/contract.api";
import { FileText, Clock } from "lucide-react";
import toast from "react-hot-toast";
import {
  MANUAL_PLACEHOLDERS,
  extractPlaceholderKeys,
} from "@/lib/contractPlaceholders";

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
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  const { data: contractTemplates, isLoading } = useGetContractTemplates();
  const { mutate: assignContract, isPending } = useCreateAssignContract();

  const selectedContract = contractTemplates?.items?.find(
    (contract: any) => contract._id === selectedContractId
  );

  const requiredPlaceholders = useMemo(() => {
    if (!selectedContract) return [];
    const keysInContent = extractPlaceholderKeys(selectedContract.content);
    return MANUAL_PLACEHOLDERS.filter((p) => keysInContent.includes(p.key));
  }, [selectedContract]);

  const handleSelectContract = (id: string) => {
    setSelectedContractId(id);
    setPlaceholderValues({});
  };

  const handleAssign = () => {
    if (!selectedContractId) {
      toast.error("Please select a contract");
      return;
    }

    const missing = requiredPlaceholders.filter((p) => !placeholderValues[p.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((p) => p.label).join(", ")}`);
      return;
    }

    assignContract(
      {
        contractId: selectedContractId,
        assignedTo: userId,
        placeholderValues,
      },
      {
        onSuccess: () => {
          toast.success("Contract assigned successfully");
          onOpenChange(false);
          setSelectedContractId("");
          setPlaceholderValues({});
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to assign contract");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Contract</DialogTitle>
          <DialogDescription>Assign an internship contract to {userName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract">Select Contract Template</Label>
            <Select value={selectedContractId} onValueChange={handleSelectContract}>
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

              {requiredPlaceholders.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-600">
                    Fill in the details for this contract
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {requiredPlaceholders.map((p) => (
                      <div key={p.key} className="space-y-1">
                        <Label htmlFor={p.key} className="text-xs">
                          {p.label}
                        </Label>
                        <Input
                          id={p.key}
                          type={p.kind === "date" ? "date" : p.kind === "number" ? "number" : "text"}
                          value={placeholderValues[p.key] || ""}
                          onChange={(e) =>
                            setPlaceholderValues((prev) => ({
                              ...prev,
                              [p.key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedContractId || isPending} className="gap-2">
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
