import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export const LeaveHistorySkeleton = () => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-32 h-8" />
        </div>
        <Skeleton className="w-64 h-4 mt-1" />
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-gray-300 rounded-md p-3 bg-white">
              {/* First row */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="w-4 h-4" />
                  <div>
                    <Skeleton className="w-48 h-4 mb-1" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                </div>
                <Skeleton className="w-20 h-6 rounded-md" />
              </div>

              {/* Second row */}
              <div className="flex items-start gap-2">
                <Skeleton className="w-3 h-3 mt-0.5" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="w-10 h-4" />
              <Skeleton className="w-16 h-8" />
              <Skeleton className="w-16 h-4" />
            </div>
            <Skeleton className="w-32 h-4" />
          </div>
          
          <div className="flex items-center gap-2">
            <Skeleton className="w-20 h-8" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8" />
              ))}
            </div>
            <Skeleton className="w-16 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};