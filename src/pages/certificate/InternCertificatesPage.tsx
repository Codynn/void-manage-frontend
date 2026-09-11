import { useRef, useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Download, Image as ImageIcon, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useGetMyCertificates } from "@/services/api/certificate.api";
import { useGetUserData } from "@/services/api/user.api";
import ContractDocumentPreview from "@/components/contract/ContractDocumentPreview";
import { exportNodeAsPdf, exportNodeAsPng } from "@/lib/exportContract";
import type { ICertificateInstance } from "@/types/certificate.type";

const TYPE_LABEL: Record<string, string> = {
  completion: "Completion Certificate",
  recommendation: "Letter of Recommendation",
};

const InternCertificatesPage = () => {
  const { data: certificates, isLoading } = useGetMyCertificates();
  const { data: profileData } = useGetUserData();
  const [selectedCertificate, setSelectedCertificate] = useState<ICertificateInstance | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const list: ICertificateInstance[] = certificates || [];
  const activeCertificate = selectedCertificate || list[0] || null;

  const handleDownload = async (type: "pdf" | "png") => {
    if (!previewRef.current || !activeCertificate) return;
    const filename = `${activeCertificate.template?.title || "certificate"}.${type}`;
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

  return (
    <main className="p-6 space-y-6">
      <TitleHeader title="My Certificates" description="View and download your issued certificates" />

      {!isLoading && list.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Award className="w-10 h-10 mx-auto mb-3" />
            No certificates have been issued to you yet.
          </CardContent>
        </Card>
      )}

      {list.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {list.map((cert) => (
              <Card
                key={cert._id}
                className={`cursor-pointer transition-colors ${
                  activeCertificate?._id === cert._id ? "border-primary" : ""
                }`}
                onClick={() => setSelectedCertificate(cert)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4" />
                    <h4 className="font-medium text-sm">{cert.template?.title}</h4>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {TYPE_LABEL[cert.template?.type] || cert.template?.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    Issued on {new Date(cert.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{activeCertificate?.template?.title}</CardTitle>
                    <CardDescription>{activeCertificate?.template?.companyName}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleDownload("png")}>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Image
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload("pdf")}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeCertificate && (
                  <ContractDocumentPreview
                    ref={previewRef}
                    content={activeCertificate.template?.content ?? null}
                    layout={activeCertificate.template?.layout}
                    mode="fill"
                    values={{
                      username: profileData?.username,
                      userEmail: profileData?.email,
                      ...activeCertificate.placeholderValues,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
};

export default InternCertificatesPage;
