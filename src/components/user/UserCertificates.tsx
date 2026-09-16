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
import { Award, Plus, Eye, Trash2 } from "lucide-react";
import type { IUserData } from "@/types/user.type";
import { IssueCertificateDialog } from "@/components/certificate/IssueCertificateDialog";
import { useGetCertificatesByUserId, useRevokeCertificate } from "@/services/api/certificate.api";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import type { ICertificateInstance } from "@/types/certificate.type";

interface UserCertificatesProps {
  userData: IUserData;
  currentUserRole?: string;
}

const TYPE_LABEL: Record<string, string> = {
  completion: "Completion Certificate",
  recommendation: "Letter of Recommendation",
};

export const UserCertificates = ({ userData, currentUserRole }: UserCertificatesProps) => {
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState<ICertificateInstance | null>(null);

  const { data: certificates } = useGetCertificatesByUserId(userData._id);
  const { mutate: revokeCertificate, isPending: isRevoking } = useRevokeCertificate();

  const canIssue = currentUserRole === "ADMIN";
  const list: ICertificateInstance[] = certificates || [];

  return (
    <>
      <IssueCertificateDialog
        open={showIssueDialog}
        onOpenChange={setShowIssueDialog}
        userId={userData._id}
        userName={userData.username}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5" />
                Certificates
              </CardTitle>
              <CardDescription>Completion certificates and recommendation letters</CardDescription>
            </div>
            {canIssue && (
              <Button size="sm" onClick={() => setShowIssueDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Issue
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {list.length > 0 ? (
            <div className="space-y-3">
              {list.map((cert) => (
                <div
                  key={cert._id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{cert.template?.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABEL[cert.template?.type] || cert.template?.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Issued on {new Date(cert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      onClick={() => setPreviewCertificate(cert)}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    {canIssue && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs text-destructive hover:text-destructive"
                        disabled={isRevoking}
                        onClick={() => revokeCertificate(cert._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-1">No certificates issued yet</p>
              <p className="text-xs text-gray-500">
                {canIssue
                  ? "Click issue to add a certificate"
                  : "Certificates will be issued by admin"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {previewCertificate && (
        <Dialog open={!!previewCertificate} onOpenChange={(open) => !open && setPreviewCertificate(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{previewCertificate.template?.title}</DialogTitle>
            </DialogHeader>
            <ContractDocumentPreview
              content={previewCertificate.template?.content ?? null}
              layout={previewCertificate.template?.layout}
              mode="fill"
              values={{
                username: userData.username,
                userEmail: userData.email,
                department:
                  typeof userData.department === "string"
                    ? undefined
                    : userData.department?.name,
                ...previewCertificate.placeholderValues,
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
