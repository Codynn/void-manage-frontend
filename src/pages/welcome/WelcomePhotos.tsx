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
  useAddWelcomePhotos,
  useRemoveWelcomePhoto,
} from "@/services/api/user.api";
import { Camera, CheckCircle, LoaderCircle, Upload, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const MAX_PHOTOS = 10;

const WelcomePhotos = () => {
  const { data: profileData } = useGetUserData();
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  //   API CALLS
  const { mutateAsync: uploadPhotos, isPending: uploading } = useUploadPhoto();
  const { mutateAsync: addWelcomePhotos, isPending: saving } = useAddWelcomePhotos();
  const { mutate: removePhoto } = useRemoveWelcomePhoto();

  const existingPhotos: string[] = profileData?.welcomePhotos || [];
  const remainingSlots = MAX_PHOTOS - existingPhotos.length;
  const atLimit = remainingSlots <= 0;

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
    const validImages = fileArray.filter((file) => file.size <= 5 * 1024 * 1024);

    if (validImages.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more photo(s) (max ${MAX_PHOTOS} total)`);
    }
    const allowed = validImages.slice(0, remainingSlots);

    const previewURLs = allowed.map((file) => URL.createObjectURL(file));

    setPreviews(previewURLs);
    setFiles(allowed);
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

      await addWelcomePhotos(fileUrls);
      handleClear();
    } catch (err) {
      console.error("Error uploading files:", err);
    }
  };

  const handleDelete = (url: string) => {
    setDeletingUrl(url);
    removePhoto(url, { onSettled: () => setDeletingUrl(null) });
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Welcome Photos"
        description="Upload photos for social media welcome posts"
      />

      {/* Uploaded Photos */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Your Photos
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {existingPhotos.length}/{MAX_PHOTOS}
            </span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Photos you've uploaded so far
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingPhotos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              You haven't uploaded any welcome photos yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {existingPhotos.map((url) => (
                <div key={url} className="relative group aspect-square">
                  <img
                    src={url}
                    alt="Welcome"
                    className="h-full w-full object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={deletingUrl === url}
                    onClick={() => handleDelete(url)}
                    aria-label="Delete photo"
                  >
                    {deletingUrl === url ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200 relative">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Add Photos
          </CardTitle>
          <CardDescription className="text-gray-600">
            {atLimit
              ? `You've reached the maximum of ${MAX_PHOTOS} photos. Delete one to add more.`
              : `You can add up to ${remainingSlots} more photo(s).`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {atLimit ? null : previews.length > 0 ? (
            <div className="relative">
              <Button
                variant="destructive"
                onClick={handleClear}
                className="absolute top-0 right-0 mt-2 mr-2 "
              >
                Clear
              </Button>

              <div className="flex justify-center items-center flex-wrap gap-4 mb-6 mt-4">
                {previews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="h-48 w-auto object-contain rounded border"
                  />
                ))}
              </div>

              <div className="text-center">
                <Button disabled={uploading || saving} onClick={handleConfirmUpload}>
                  Confirm Upload
                  {(uploading || saving) && <LoaderCircle className="animate-spin ml-2" />}
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
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default WelcomePhotos;
