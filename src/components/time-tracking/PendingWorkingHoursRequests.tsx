import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import {
  useGetWorkingHoursRequests,
  useApproveWorkingHoursRequest,
  useRejectWorkingHoursRequest,
} from "@/services/api/workingHours.api";

const formatShifts = (shifts: { startTime: string; endTime: string }[]) =>
  shifts.map((s) => `${s.startTime} - ${s.endTime}`).join(", ");

// Compact "pending working hours requests" card for a single user, used on
// the admin's per-user time history page.
const PendingWorkingHoursRequests = ({ userId }: { userId?: string }) => {
  const { data: requests } = useGetWorkingHoursRequests(
    userId ? { status: "PENDING", userId } : undefined
  );
  const { mutate: approve, isPending: isApproving } = useApproveWorkingHoursRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectWorkingHoursRequest();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (!userId || !requests?.length) return null;

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    reject(
      { id: rejectTarget, comment: rejectReason.trim() },
      { onSuccess: () => { setRejectTarget(null); setRejectReason(""); } }
    );
  };

  return (
    <>
      <Card className="border-yellow-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-yellow-600" />
            Pending Working Hours Requests
          </CardTitle>
          <CardDescription>Awaiting your approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {requests.map((req) => (
            <div
              key={req._id}
              className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
            >
              <div>
                <span className="font-medium">{req.dayOfWeek}</span>{" "}
                <span className="text-muted-foreground">{formatShifts(req.shifts)}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" disabled={isApproving} onClick={() => approve(req._id)} className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isRejecting}
                  onClick={() => setRejectTarget(req._id)}
                  className="gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason shown to the user"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!rejectReason.trim() || isRejecting} onClick={handleReject}>
              {isRejecting ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingWorkingHoursRequests;
