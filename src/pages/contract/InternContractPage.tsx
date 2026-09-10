import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useGetAssignedContract, useSignContract } from "@/services/api/contract.api";
import { useUploadFile } from "@/services/api/documents.api";
import { useGetUserData } from "@/services/api/user.api";
import { FileText, CheckCircle, Clock, Download, Image as ImageIcon, Pen, XCircle } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import { exportNodeAsPdf, exportNodeAsPng } from "@/lib/exportContract";

const InternContractPage = () => {
  const [pendingSignature, setPendingSignature] = useState<File | null>(null);
  const [isSigningContract, setIsSigningContract] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  //   API CALLS
  const { data: assignedContractData } = useGetAssignedContract();
  const { data: profileData } = useGetUserData();
  const { mutate: signContract, isPending: isSigningPending } = useSignContract();
  const { mutateAsync: uploadFile, isPending: isUploadingSignature } = useUploadFile();

  const contractInstance = assignedContractData?.items?.[0];
  const contractTemplate = contractInstance?.model;
  const contractStatus = contractInstance?.status || "pending";
  const canSign = contractStatus === "pending" || contractStatus === "rejected";
  const isApproved = contractStatus === "approved";

  const pendingSignaturePreviewUrl = useMemo(
    () => (pendingSignature ? URL.createObjectURL(pendingSignature) : undefined),
    [pendingSignature]
  );

  const placeholderValues = {
    username: profileData?.username,
    userEmail: profileData?.email,
    ...contractInstance?.placeholderValues,
    // Once rejected, the old signature is cleared from view until a new one is attached
    signatureImage: canSign ? pendingSignaturePreviewUrl : contractInstance?.signatureFileUrl?.url,
  };

  const handleSignContract = async () => {
    if (!pendingSignature) {
      toast.error("Please attach your signature first");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    const instanceId = contractInstance?._id;
    if (!instanceId) {
      toast.error("Contract instance not found");
      return;
    }

    setIsSigningContract(true);
    try {
      const formData = new FormData();
      formData.append("file", pendingSignature);
      const uploadedFile = await uploadFile(formData);

      signContract(
        { instanceId, signatureFileId: uploadedFile._id, agreedToTerms },
        {
          onSuccess: () => setIsSigningContract(false),
          onError: () => setIsSigningContract(false),
        }
      );
    } catch {
      setIsSigningContract(false);
    }
  };

  const handleDownload = async (type: "pdf" | "png") => {
    if (!previewRef.current) return;
    const filename = `${contractTemplate?.title || "contract"}.${type}`;
    try {
      if (type === "pdf") {
        await exportNodeAsPdf(previewRef.current, filename);
      } else {
        await exportNodeAsPng(previewRef.current, filename);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate download. Please try again.");
    }
  };

  if (!contractInstance) {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
        <TitleHeader title="Contract Signing" description="Review and sign your internship agreement" />
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3" />
            No contract has been assigned to you yet.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <TitleHeader title="Contract Signing" description="Review and sign your internship agreement" />

      {/* Contract Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {contractTemplate?.title} - {contractTemplate?.companyName}
          </CardTitle>
          <CardDescription>Please review the contract below before signing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              {contractStatus === "approved" ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : contractStatus === "rejected" ? (
                <XCircle className="w-6 h-6 text-red-500" />
              ) : contractStatus === "signed" ? (
                <Clock className="w-6 h-6 text-blue-500" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {contractStatus === "approved"
                    ? "Contract Approved"
                    : contractStatus === "rejected"
                    ? "Contract Rejected - Please Resubmit"
                    : contractStatus === "signed"
                    ? "Contract Signed - Pending Approval"
                    : "Pending Signature"}
                </p>
                <p className="text-gray-800 text-sm">
                  {contractStatus === "pending" || contractStatus === "rejected"
                    ? "Please review and sign the contract to proceed"
                    : contractInstance.signedAt &&
                      `Signed on ${new Date(contractInstance.signedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
            {contractStatus !== "pending" && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleDownload("png")}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button variant="outline" onClick={() => handleDownload("pdf")}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>

          {contractStatus === "rejected" && contractInstance.rejectionMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">Reason for rejection</p>
              <p className="mt-1 text-sm text-red-700">{contractInstance.rejectionMessage}</p>
            </div>
          )}

          {!isApproved && contractStatus !== "pending" && (
            <p className="text-xs text-muted-foreground">
              This contract is not yet verified by admin - downloads carry a "NOT VERIFIED" watermark
              until it's approved.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contract Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Preview</CardTitle>
          <CardDescription>
            {canSign
              ? "Click the signature area below to attach your signature"
              : "Your signed contract"}
          </CardDescription>
        </CardHeader>
        <CardContent onContextMenu={(e) => !isApproved && e.preventDefault()}>
          <div className={!isApproved && contractStatus !== "pending" ? "select-none" : undefined}>
            <ContractDocumentPreview
              ref={previewRef}
              content={contractTemplate?.content ?? null}
              layout={contractTemplate?.layout}
              mode="fill"
              values={placeholderValues}
              watermark={!isApproved && contractStatus !== "pending"}
              onImageSelect={canSign ? (_key, file) => setPendingSignature(file) : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sign section */}
      {canSign && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pen className="w-5 h-5" />
              Confirm & Sign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    className="text-sm font-medium leading-relaxed cursor-pointer text-blue-900"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    I confirm that I have carefully read and understood all terms and conditions of
                    this internship contract, and I agree to be legally bound by them.
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-300">
              <div className="text-sm text-gray-600">
                {!pendingSignature && !agreedToTerms && "Please attach your signature and agree to terms"}
                {pendingSignature && !agreedToTerms && "Please agree to the terms to continue"}
                {!pendingSignature && agreedToTerms && "Please attach your signature to continue"}
                {pendingSignature && agreedToTerms && "Ready to sign your contract"}
              </div>
              <Button
                onClick={handleSignContract}
                disabled={
                  !pendingSignature ||
                  !agreedToTerms ||
                  isSigningContract ||
                  isSigningPending ||
                  isUploadingSignature
                }
                className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSigningContract || isSigningPending || isUploadingSignature ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Signing Contract...
                  </>
                ) : (
                  <>
                    <Pen className="w-4 h-4 mr-2" />
                    {contractStatus === "rejected" ? "Resubmit Contract" : "Sign Contract"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default InternContractPage;
