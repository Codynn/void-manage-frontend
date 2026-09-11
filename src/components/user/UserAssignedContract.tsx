import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Clock, CheckCircle, Plus, Eye, ShieldCheck, XCircle } from "lucide-react";
import type { IUserData } from "@/types/user.type";
import { AssignContractDialog } from "./AssignContractDialog";
import {
  useApproveContract,
  useGetAssignedContractsByUserId,
  useRejectContract,
} from "@/services/api/contract.api";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";

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

  // Fetch this user's assigned contract
  const { data: assignedContractData } = useGetAssignedContractsByUserId(userData._id);

  const assignedContract = assignedContractData?.[0];
  const { mutate: approveContract, isPending: isApproving } = useApproveContract();
  const { mutate: rejectContract, isPending: isRejecting } = useRejectContract();

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
      }
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
                    assignedContract.status
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

              {assignedContract.status === "rejected" && assignedContract.rejectionMessage && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {assignedContract.rejectionMessage}
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
                {currentUserRole === "ADMIN" && assignedContract.status === "signed" && (
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
              <DialogTitle>{assignedContract.model?.title}</DialogTitle>
            </DialogHeader>
            <ContractDocumentPreview
              content={assignedContract.model?.content ?? null}
              layout={assignedContract.model?.layout}
              mode="fill"
              watermark={assignedContract.status !== "approved"}
              values={{
                username: userData.username,
                userEmail: userData.email,
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
                This message will be shown to {userData.username} so they can fix and resubmit.
              </p>
              <Textarea
                placeholder="e.g. Signature is unclear, please resubmit with a clearer image."
                value={rejectMessage}
                onChange={(e) => setRejectMessage(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
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
    </>
  );
};
