import TitleHeader from "@/components/layout/TitleHeader";
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
import { useUploadPhoto } from "@/services/api/upload.api";
import {
  useGetUserData,
  useUpdateWelcomePhotos,
} from "@/services/api/user.api";
import { Camera, CheckCircle, LoaderCircle, Upload } from "lucide-react";
import { useState } from "react";

const samplePhotos = [
  "https://preview-intern-onboarding-system-kzmq8gsc85c2cu147adw.vusercontent.net/placeholder.svg?height=200&width=200",
  "https://preview-intern-onboarding-system-kzmq8gsc85c2cu147adw.vusercontent.net/placeholder.svg?height=200&width=200",
  "https://preview-intern-onboarding-system-kzmq8gsc85c2cu147adw.vusercontent.net/placeholder.svg?height=200&width=200",
];

const WelcomePhotos = () => {
  const { data: profileData } = useGetUserData();
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const { mutate: updatePhotos } = useUpdateWelcomePhotos();

  //   API CALLS
  const { mutateAsync: uploadPhotos, isPending: uploading } = useUploadPhoto();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const fileArray = Array.from(fileList);
    const validImages = fileArray.filter(
      (file) => file.size <= 5 * 1024 * 1024
    ); 

    const previewURLs = validImages.map((file) => URL.createObjectURL(file));

    setPreviews(previewURLs);
    setFiles(validImages);
  };

  const handleClear = () => {
    setPreviews([]);
    setFiles([]);
  };

  const handleConfirmUpload = async () => {
    if (!files.length) return;

    try {
      const fileUrls: string[] = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("photo", file);

          const data = await uploadPhotos(formData);
          const url = data?.data?.photo?.photoFile?.url; 

          if (!url) throw new Error("Upload failed: No URL returned");
          return url;
        })
      );

      updatePhotos({ userId:profileData?._id, welcomePhotos: fileUrls });
    } catch (err) {
      console.error("Error uploading files:", err);
    }
  };

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <TitleHeader
        title="Welcome Photos"
        description="Upload photos for social media welcome posts"
      />

      <Card className="bg-white border-gray-200 relative">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Your Photos
          </CardTitle>
          <CardDescription className="text-gray-600">
            Upload professional photos that can be used for social media welcome
            posts
          </CardDescription>
        </CardHeader>

        <CardContent>
          {previews.length > 0 ? (
            <div className="relative">
              {/* Clear button at top right */}
              <Button
                variant="destructive"
                onClick={handleClear}
                className="absolute top-0 right-0 mt-2 mr-2 "
              >
                Clear / Re-upload
              </Button>

              {/* Image preview centered */}
              <div className="flex justify-center items-center flex-wrap gap-4 mb-6 mt-4">
                {previews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Uploaded Preview ${idx + 1}`}
                    className="h-48 w-auto object-contain rounded border"
                  />
                ))}
              </div>

              {/* Confirm button */}
              <div className="text-center">
                <Button disabled={uploading} onClick={handleConfirmUpload}>
                  Confirm Upload
                  {uploading && <LoaderCircle className="animate-spin ml-2" />}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-gray-900 bg-gray-100"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-gray-900 font-medium mb-2">
                Drag and drop your photos here
              </h3>
              <p className="text-gray-600 mb-4">or click to browse files</p>
              <Label htmlFor="photo-upload">
                <Button asChild>
                  <span>Choose Files</span>
                </Button>
              </Label>
              <Input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <p className="text-gray-500 text-sm mt-4">
                Supported formats: JPG, PNG, GIF (Max 5MB per file)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Photos */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 text-2xl">
            Sample Photos
          </CardTitle>
          <CardDescription className="text-gray-600">
            Examples of appropriate photos for social media and company use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {samplePhotos.map((photo, index) => (
              <div key={index} className="space-y-3">
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Sample photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <div className="space-y-1">
                  <h4 className="text-gray-900 font-medium">
                    {index === 0 && "Professional Headshot"}
                    {index === 1 && "Workspace Setup"}
                    {index === 2 && "Team Collaboration"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {index === 0 &&
                      "Clear, professional photo for LinkedIn and company website"}
                    {index === 1 &&
                      "Your workspace setup showing your work environment"}
                    {index === 2 &&
                      "Photos during team meetings or collaborative work"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Photo Guidelines for Welcome Posts
          </CardTitle>
          <CardDescription className="text-gray-600">
            Important guidelines for welcome post photo submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900">
                High-quality, well-lit photos
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900">
                Professional attire and appearance
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900">
                Clear background, preferably neutral
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900">
                Photos should represent you and your work positively
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900">
                Photos must be approved for company social media use
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-900">
                Include a brief introduction about yourself in the submission
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default WelcomePhotos;
