
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera,  Download } from "lucide-react";
import type { IUserData } from "@/types/user.type";

interface UserWelcomePhotosProps {
  userData: IUserData;
  currentUserRole?: string;
}

const UserWelcomePhotos = ({ userData, currentUserRole }: UserWelcomePhotosProps) => {
  

  const handleDownloadPhoto = async (photoUrl: string, index: number) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${userData.username || 'user'}-welcome-photo-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download photo:', error);
    }
  };


  if (currentUserRole !== "ADMIN") {
    return null;
  }

  return (
    <Card className="border-0 shadow-sm gap-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Camera className="h-4 w-4 text-gray-600" />
            Welcome Photos
          </CardTitle>
          {/* <Dialog open={uploadPhotosOpen} onOpenChange={setUploadPhotosOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-2 h-8">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Welcome Photos</DialogTitle>
                <DialogDescription>
                  Add welcome photos for this user. Enter photo URLs separated by commas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="photos">Photo URLs</Label>
                  <Input
                    id="photos"
                    placeholder="https://example.com/photo1.jpg, https://example.com/photo2.jpg"
                    value={welcomePhotosInput}
                    onChange={(e) => setWelcomePhotosInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUploadPhotosOpen(false)}
                  disabled={uploadPhotosMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUploadPhotos}
                  disabled={uploadPhotosMutation.isPending || !welcomePhotosInput.trim()}
                >
                  {uploadPhotosMutation.isPending ? (
                    <>
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Photos"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}
        </div>
      </CardHeader>
      <CardContent>
        {userData.welcomePhotos && userData.welcomePhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userData.welcomePhotos.map((photo: string, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Welcome photo ${index + 1}`}
                  className="w-full h-32 md:h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700 transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                {/* Download button overlay - only shows on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-end justify-center pb-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-2 shadow-lg"
                    onClick={() => handleDownloadPhoto(photo, index)}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Camera className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No photos uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserWelcomePhotos;
