import { personalPlaceholderValues } from "@/lib/contractPlaceholders";
import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Eye,
  ShieldCheck,
  XCircle,
  Pencil,
  Download,
  Image as ImageIcon,
  AlertTriangle,
  ListChecks,
} from "lucide-react";
import toast from "react-hot-toast";
import type { IUserData } from "@/types/user.type";
import { AssignContractDialog } from "./AssignContractDialog";
import {
  useApproveContract,
  useGetAssignedContractsByUserId,
  useRejectContract,
  useUpdateContractInstanceContent,
  useUpdateContractInstancePlaceholders,
} from "@/services/api/contract.api";
import ContractPagesPreview, {
  type ContractPagesPreviewHandle,
} from "@/components/contract/ContractPagesPreview";
import ContractPagesEditor, {
  createEmptyPage,
  type ContractPageData,
} from "@/components/contract/ContractPagesEditor";
import { exportNodesAsPdf, exportNodesAsPng } from "@/lib/exportContract";
import {
  MANUAL_PLACEHOLDERS,
  extractPlaceholderKeysFromPages,
} from "@/lib/contractPlaceholders";

interface UserAssignedContractProps {
  userData: IUserData;
  currentUserRole?: string;
}

export const UserAssignedContract = ({
  userData,
  currentUserRole,
}: UserAssignedContractProps) => {
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editPages, setEditPages] = useState<ContractPageData[]>([]);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editPlaceholders, setEditPlaceholders] = useState<
    Record<string, string>
  >({});
  const previewRef = useRef<ContractPagesPreviewHandle>(null);

  // Fetch this user's assigned contract
  const { data: assignedContractData } = useGetAssignedContractsByUserId(
    userData._id,
  );

  const assignedContract = assignedContractData?.[0];
  const { mutate: approveContract, isPending: isApproving } =
    useApproveContract();
  const { mutate: rejectContract, isPending: isRejecting } =
    useRejectContract();
  const { mutate: updateContent, isPending: isSavingContent } =
    useUpdateContractInstanceContent();
  const { mutate: updatePlaceholders, isPending: isSavingPlaceholders } =
    useUpdateContractInstancePlaceholders();

  const canEditContent =
    currentUserRole === "ADMIN" &&
    (assignedContract?.status === "pending" ||
      assignedContract?.status === "rejected");

  const pages =
    assignedContract?.pagesOverride ?? assignedContract?.model?.pages ?? [];

  // Manual placeholders (startDate, internshipTitle, mentorName, ...) actually
  // used in this contract's content - these are never auto-filled, so when a
  // contract gets auto-assigned via a department's role template (no Assign
  // dialog involved), they're left blank until an admin fills them in here.
  const usedManualKeys = extractPlaceholderKeysFromPages(pages).filter((key) =>
    MANUAL_PLACEHOLDERS.some((p) => p.key === key),
  );
  const missingPlaceholderKeys = usedManualKeys.filter(
    (key) => !assignedContract?.placeholderValues?.[key],
  );

  const openEditDialog = () => {
    if (!assignedContract) return;
    setEditPages(pages.length ? pages : [createEmptyPage()]);
    setShowEditDialog(true);
  };

  const openDetailsDialog = () => {
    if (!assignedContract) return;
    const initial: Record<string, string> = {};
    usedManualKeys.forEach((key) => {
      initial[key] = assignedContract.placeholderValues?.[key] || "";
    });
    setEditPlaceholders(initial);
    setShowDetailsDialog(true);
  };

  const handleSavePlaceholders = () => {
    if (!assignedContract) return;
    updatePlaceholders(
      { instanceId: assignedContract._id, placeholderValues: editPlaceholders },
      { onSuccess: () => setShowDetailsDialog(false) },
    );
  };

  const handleSaveContent = () => {
    if (!assignedContract || !editPages.length) return;
    updateContent(
      { instanceId: assignedContract._id, pages: editPages },
      { onSuccess: () => setShowEditDialog(false) },
    );
  };

  const handleDownload = async (type: "pdf" | "png") => {
    const nodes = previewRef.current?.getPageNodes();
    if (!nodes?.length) return;
    const filename = `${assignedContract?.model?.title || "contract"}.${type}`;
    try {
      if (type === "pdf") {
        await exportNodesAsPdf(nodes, filename);
      } else {
        await exportNodesAsPng(nodes, filename);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate download. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "signed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "signed":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const canAssign = currentUserRole === "ADMIN" || currentUserRole === "MENTOR";

  const handleReject = () => {
    if (!assignedContract || !rejectMessage.trim()) return;
    rejectContract(
      { instanceId: assignedContract._id, message: rejectMessage.trim() },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectMessage("");
        },
      },
    );
  };

  return (
    <>
      <AssignContractDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        userId={userData._id}
        userName={userData.username}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Contract
              </CardTitle>
              <CardDescription>
                {assignedContract
                  ? "Internship contract assigned"
                  : "Internship contract status"}
              </CardDescription>
            </div>
            {canAssign && !assignedContract && (
              <Button
                size="sm"
                onClick={() => setShowAssignDialog(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Assign
              </Button>
            )}
            {canAssign && assignedContract && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Assigned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {assignedContract ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(assignedContract.status)}
                    <h4 className="font-medium text-sm">
                      {assignedContract.model?.title}
                    </h4>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Company: {assignedContract.model?.companyName}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    assignedContract.status,
                  )} capitalize text-xs`}
                >
                  {assignedContract.status}
                </Badge>
              </div>

              {assignedContract.signedAt && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Signed on{" "}
                  {new Date(assignedContract.signedAt).toLocaleDateString()}
                </div>
              )}

              {assignedContract.status === "rejected" &&
                assignedContract.rejectionMessage && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {assignedContract.rejectionMessage}
                  </div>
                )}

              {currentUserRole === "ADMIN" &&
                missingPlaceholderKeys.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Missing {missingPlaceholderKeys.length} contract detail
                      {missingPlaceholderKeys.length === 1
                        ? ""
                        : "s"} (e.g.{" "}
                      {
                        MANUAL_PLACEHOLDERS.find(
                          (p) => p.key === missingPlaceholderKeys[0],
                        )?.label
                      }
                      ) - these show up blank in the signed contract until
                      filled in.
                    </span>
                  </div>
                )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 text-xs"
                  onClick={() => setShowPreviewDialog(true)}
                >
                  <Eye className="w-3 h-3" />
                  View Contract
                </Button>
                {canEditContent && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-2 text-xs"
                    onClick={openEditDialog}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit Content
                  </Button>
                )}
                {currentUserRole === "ADMIN" && usedManualKeys.length > 0 && (
                  <Button
                    size="sm"
                    variant={
                      missingPlaceholderKeys.length > 0 ? "default" : "outline"
                    }
                    className="flex-1 gap-2 text-xs"
                    onClick={openDetailsDialog}
                  >
                    <ListChecks className="w-3 h-3" />
                    {missingPlaceholderKeys.length > 0
                      ? "Fill Details"
                      : "Edit Details"}
                  </Button>
                )}
                {currentUserRole === "ADMIN" &&
                  assignedContract.status === "signed" && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 gap-2 text-xs"
                        disabled={isApproving || isRejecting}
                        onClick={() => approveContract(assignedContract._id)}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {isApproving ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-2 text-xs"
                        disabled={isApproving || isRejecting}
                        onClick={() => setShowRejectDialog(true)}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </Button>
                    </>
                  )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">No contract assigned</p>
              <p className="text-xs text-gray-500">
                {canAssign
                  ? "Click assign to add a contract"
                  : "Contract will be assigned by admin"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {assignedContract && (
        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-4 pr-6">
                <DialogTitle>{assignedContract.model?.title}</DialogTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownload("png")}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Image
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownload("pdf")}
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </Button>
                </div>
              </div>
            </DialogHeader>
            <ContractPagesPreview
              ref={previewRef}
              pages={pages}
              mode="fill"
              watermark={assignedContract.status !== "approved"}
              values={{
                username: userData.username,
                userEmail: userData.email,
                ...personalPlaceholderValues(userData),
                department:
                  typeof userData.department === "string"
                    ? undefined
                    : userData.department?.name,
                ...assignedContract.placeholderValues,
                signatureImage: assignedContract.signatureFileUrl?.url,
                signedAtDate: assignedContract.signedAt
                  ? new Date(assignedContract.signedAt).toLocaleDateString()
                  : undefined,
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {assignedContract && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This message will be shown to {userData.username} so they can
                fix and resubmit.
              </p>
              <Textarea
                placeholder="e.g. Signature is unclear, please resubmit with a clearer image."
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  disabled={!rejectMessage.trim() || isRejecting}
                  onClick={handleReject}
                >
                  {isRejecting ? "Rejecting..." : "Reject Contract"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {assignedContract && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-[80vw] min-w-[80vw] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Contract Content - {userData.username}
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Changes only apply to this intern's contract, not the shared
              template. Only possible before they sign.
            </p>
            {editPages.length > 0 && (
              <ContractPagesEditor pages={editPages} onChange={setEditPages} />
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveContent} disabled={isSavingContent}>
                {isSavingContent ? "Saving..." : "Save Content"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {assignedContract && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contract Details - {userData.username}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              These values are filled into the contract text (start date,
              internship title, etc). Fill them in, or correct them, at any time
              - even after signing.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {usedManualKeys.map((key) => {
                const def = MANUAL_PLACEHOLDERS.find((p) => p.key === key);
                return (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={key} className="text-xs">
                      {def?.label || key}
                    </Label>
                    <Input
                      id={key}
                      type={
                        def?.kind === "date"
                          ? "date"
                          : def?.kind === "number"
                            ? "number"
                            : "text"
                      }
                      value={editPlaceholders[key] || ""}
                      onChange={(e) =>
                        setEditPlaceholders((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSavePlaceholders}
                disabled={isSavingPlaceholders}
              >
                {isSavingPlaceholders ? "Saving..." : "Save Details"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
