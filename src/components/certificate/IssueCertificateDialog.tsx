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
import { useGetCertificateTemplates, useIssueCertificate } from "@/services/api/certificate.api";
import { Award, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { MANUAL_PLACEHOLDERS, extractPlaceholderKeys } from "@/lib/contractPlaceholders";
import type { ICertificateTemplateBase } from "@/types/certificate.type";

interface IssueCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

const TYPE_LABEL: Record<string, string> = {
  completion: "Completion Certificate",
  recommendation: "Letter of Recommendation",
};

export const IssueCertificateDialog = ({
  open,
  onOpenChange,
  userId,
  userName,
}: IssueCertificateDialogProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  const { data: templatesData, isLoading } = useGetCertificateTemplates();
  const { mutate: issueCertificate, isPending } = useIssueCertificate();

  const selectedTemplate: ICertificateTemplateBase | undefined = templatesData?.items?.find(
    (t: ICertificateTemplateBase) => t._id === selectedTemplateId
  );

  const requiredPlaceholders = useMemo(() => {
    if (!selectedTemplate) return [];
    const keysInContent = extractPlaceholderKeys(selectedTemplate.content);
    return MANUAL_PLACEHOLDERS.filter((p) => keysInContent.includes(p.key));
  }, [selectedTemplate]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setPlaceholderValues({});
  };

  const handleIssue = () => {
    if (!selectedTemplateId) {
      toast.error("Please select a certificate template");
      return;
    }

    const missing = requiredPlaceholders.filter((p) => !placeholderValues[p.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((p) => p.label).join(", ")}`);
      return;
    }

    issueCertificate(
      { templateId: selectedTemplateId, assignedTo: userId, placeholderValues },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedTemplateId("");
          setPlaceholderValues({});
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Issue Certificate</DialogTitle>
          <DialogDescription>Issue a certificate or letter to {userName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template">Select Template</Label>
            <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="Choose a certificate template" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading templates...
                  </SelectItem>
                ) : templatesData?.items?.length > 0 ? (
                  templatesData.items.map((template: ICertificateTemplateBase) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.title} ({TYPE_LABEL[template.type]})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No templates available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border">
                  <Award className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{selectedTemplate.title}</h4>
                  <p className="text-xs text-gray-600">{selectedTemplate.companyName}</p>
                </div>
              </div>

              {requiredPlaceholders.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-600">
                    Fill in the details for this certificate
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
          <Button onClick={handleIssue} disabled={!selectedTemplateId || isPending} className="gap-2">
            {isPending ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Issuing...
              </>
            ) : (
              "Issue Certificate"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
