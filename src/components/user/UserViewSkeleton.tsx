import { Skeleton } from "@/components/ui/skeleton";

const UserViewSkeleton = () => {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserViewSkeleton;
