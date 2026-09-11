import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useGetMyWorkingHoursRequests } from "@/services/api/workingHours.api";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
};

const formatShifts = (shifts: { startTime: string; endTime: string }[]) =>
  shifts.map((s) => `${s.startTime}-${s.endTime}`).join(", ");

const MyWorkingHoursRequests = () => {
  const { data: requests, isLoading } = useGetMyWorkingHoursRequests();

  if (isLoading || !requests?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Working Hours Requests</CardTitle>
        <CardDescription>
          Track the status of the working hours you've submitted for review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((req) => {
          const Icon = STATUS_ICON[req.status];
          return (
            <div key={req._id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{req.dayOfWeek}</span>
                  <span className="text-xs text-muted-foreground">{formatShifts(req.shifts)}</span>
                </div>
                <Badge variant="outline" className={STATUS_STYLES[req.status]}>
                  {req.status}
                </Badge>
              </div>
              {req.status === "REJECTED" && req.adminComment && (
                <p className="text-xs text-red-700">Reason: {req.adminComment}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default MyWorkingHoursRequests;
