import TitleHeader from "@/components/layout/TitleHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetAssignedContract, useSignContract } from "@/services/api/contract.api";
import { FileText, CheckCircle, Clock, Download, Pen, X, Upload } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const InternContractPage = () => {
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isSigningContract, setIsSigningContract] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  

  //   API CALLS
  const { data: assignedContractData } =
    useGetAssignedContract();
  const { mutate: signContract, isPending: isSigningPending } = useSignContract();

  const contractData = assignedContractData?.items[0]?.model;
  const contractInstance = assignedContractData?.items[0];
  const contractStatus = contractInstance?.status || 'pending'; // pending, signed, approved

  const contractTerms = contractData?.terms || [];

  const handleSignatureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (only images)
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file for your signature');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setSignatureFile(file);
      toast.success('Signature uploaded successfully!');
    }
  };

  const removeSignature = () => {
    setSignatureFile(null);
    // Reset the file input
    const fileInput = document.getElementById('signature') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    toast.success('Signature removed');
  };

  const handleSignContract = () => {
    if (!signatureFile) {
      toast.error('Please upload your signature first');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Get the contract instance ID from the assigned contract data
    const instanceId = contractInstance?._id;
    
    if (!instanceId) {
      toast.error('Contract instance not found');
      return;
    }

    setIsSigningContract(true);
    
    const signatureData = {
      instanceId: instanceId,
      signature: signatureFile,
      agreedToTerms: agreedToTerms
    };

    signContract(signatureData, {
      onSuccess: () => {
        setIsSigningContract(false);
        // The success handling is done in the API hook
      },
      onError: () => {
        setIsSigningContract(false);
        // The error handling is done in the API hook
      }
    });
  };

  return (
    <main className="min-h-screen  p-6 max-w-4xl mx-auto space-y-6">
      <TitleHeader
        title="Contract Signing"
        description="Review and sign your internship agreement"
      />

      {/* Contract Status */}
      <Card className="">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Internship Agreement - {contractData?.companyName || "Void Nepal Private Limited"}
          </CardTitle>
          <CardDescription className="">
            Please review the terms and conditions carefully before signing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              {contractStatus === 'approved' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : contractStatus === 'signed' ? (
                <Clock className="w-6 h-6 text-blue-500" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <p className=" font-medium">
                  {contractStatus === 'approved' 
                    ? "Contract Approved" 
                    : contractStatus === 'signed' 
                    ? "Contract Signed - Pending Approval" 
                    : "Pending Signature"}
                </p>
                <p className="text-gray-800 text-sm">
                  {contractStatus === 'approved'
                    ? `Approved on ${contractInstance?.signedAt ? new Date(contractInstance.signedAt).toLocaleDateString() : new Date().toLocaleDateString()}`
                    : contractStatus === 'signed'
                    ? `Signed on ${contractInstance?.signedAt ? new Date(contractInstance.signedAt).toLocaleDateString() : new Date().toLocaleDateString()} - Awaiting admin approval`
                    : "Please review and sign the contract to proceed"}
                </p>
              </div>
            </div>
            {contractStatus === 'approved' && (
              <Button
                variant="outline"
                className="border-gray-700  bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Terms */}
      <Card className="">
        <CardHeader>
          <CardTitle className="">Terms and Conditions</CardTitle>
          <CardDescription className="text-gray-800">
            Key terms of your internship agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              {contractTerms.map((term:string, index:number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="">{term}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className=" font-semibold mb-3">Company Information</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-800">Company Name:</p>
                  <p className="">{contractData?.companyName || "Void Nepal Private Limited"}</p>
                </div>
                <div>
                  <p className="text-gray-800">Document Title:</p>
                  <p className="">{contractData?.title}</p>
                </div>
                <div>
                  <p className="text-gray-800 ">Mode:</p>
                  <p className="capitalize">{contractData?.mode}</p>
                </div>
                <div>
                  <p className="text-gray-800">Total Duration:</p>
                  <p className="">{contractData?.totalDurationHours} Hours</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h4 className=" font-semibold mb-3">Tools and Platforms</h4>
              <div className="flex flex-wrap gap-2">
                {contractData?.tools?.map(
                  (tool:string) => (
                    <Badge
                      key={tool}
                      variant="outline"
                      className="border-gray-700 text-gray-800 capitalize"
                    >
                      {tool}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signed Contract Information */}
      {(contractStatus === 'signed' || contractStatus === 'approved') && contractInstance?.signatureFileUrl && (
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Contract Signature
            </CardTitle>
            <CardDescription className="text-gray-800">
              Your digital signature on the contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Contract {contractStatus === 'approved' ? 'Approved' : 'Signed'}
                    </p>
                    <p className="text-xs text-green-600">
                      {contractInstance.signedAt && `Signed on ${new Date(contractInstance.signedAt).toLocaleDateString()} at ${new Date(contractInstance.signedAt).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-green-800">Your Signature:</Label>
                  <div className="border-2 border-green-300 rounded-lg p-4 bg-white">
                    <img
                      src={contractInstance.signatureFileUrl.url}
                      alt="Your signature"
                      className="max-h-24 max-w-full object-contain mx-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Upload Section */}
      {contractStatus === 'pending' && (
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pen className="w-5 h-5" />
              Digital Signature
            </CardTitle>
            <CardDescription className="text-gray-800">
              Upload your signature to sign the contract
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-sm font-medium">
                Upload Signature Image
              </Label>
              
              {!signatureFile ? (
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-lg p-6 text-center cursor-pointer group"
                       onClick={() => document.getElementById('signature')?.click()}>
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF up to 5MB
                    </p>
                  </div>
                  <Input
                    id="signature"
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{signatureFile.name}</p>
                        <p className="text-xs text-green-600">
                          {(signatureFile.size / 1024 / 1024).toFixed(2)} MB • Ready to sign
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeSignature}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {signatureFile && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Signature Preview:</Label>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={URL.createObjectURL(signatureFile)}
                    alt="Signature preview"
                    className="max-h-24 max-w-full object-contain mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  This is how your signature will appear on the contract
                </p>
              </div>
            )}

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
                    I confirm that I have carefully read and understood all terms and conditions of this internship contract, and I agree to be legally bound by them.
                  </Label>
                  <p className="text-xs text-blue-700 mt-1">
                    This digital signature will have the same legal effect as a handwritten signature.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-300">
              <div className="text-sm text-gray-600">
                {!signatureFile && !agreedToTerms && (
                  "Please upload your signature and agree to terms"
                )}
                {signatureFile && !agreedToTerms && (
                  "Please agree to the terms to continue"
                )}
                {!signatureFile && agreedToTerms && (
                  "Please upload your signature to continue"
                )}
                {signatureFile && agreedToTerms && (
                  "Ready to sign your contract"
                )}
              </div>
              <Button
                onClick={handleSignContract}
                disabled={!signatureFile || !agreedToTerms || isSigningContract || isSigningPending}
                className="bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSigningContract || isSigningPending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Signing Contract...
                  </>
                ) : (
                  <>
                    <Pen className="w-4 h-4 mr-2" />
                    Sign Contract
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
