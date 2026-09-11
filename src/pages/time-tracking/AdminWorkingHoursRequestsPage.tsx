import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, LoaderCircle } from "lucide-react";
import {
  useGetWorkingHoursRequests,
  useApproveWorkingHoursRequest,
  useRejectWorkingHoursRequest,
} from "@/services/api/workingHours.api";

const formatShifts = (shifts: { startTime: string; endTime: string }[]) =>
  shifts.map((s) => `${s.startTime} - ${s.endTime}`).join(", ");

type StatusTab = "PENDING" | "APPROVED" | "REJECTED";

const AdminWorkingHoursRequestsPage = () => {
  const [activeTab, setActiveTab] = useState<StatusTab>("PENDING");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: requests, isLoading } = useGetWorkingHoursRequests({ status: activeTab });
  const { mutate: approve, isPending: isApproving } = useApproveWorkingHoursRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectWorkingHoursRequest();

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    reject(
      { id: rejectTarget, comment: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectTarget(null);
          setRejectReason("");
        },
      }
    );
  };

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Working Hours Requests"
        description="Review and approve or reject submitted working hours"
        link="/admin/dashboard"
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusTab)}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="APPROVED">Approved</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !requests?.length ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Clock className="mx-auto mb-3 h-10 w-10" />
                No {activeTab.toLowerCase()} requests
              </CardContent>
            </Card>
          ) : (
            requests.map((req: any) => (
              <Card key={req._id}>
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.user?.username}</span>
                      <span className="text-xs text-muted-foreground">{req.user?.email}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{req.dayOfWeek}</span>{" "}
                      <span className="text-muted-foreground">{formatShifts(req.shifts)}</span>
                    </p>
                    {req.status === "REJECTED" && req.adminComment && (
                      <p className="text-xs text-red-600">Reason: {req.adminComment}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        req.status === "APPROVED"
                          ? "border-green-300 bg-green-100 text-green-800"
                          : req.status === "REJECTED"
                          ? "border-red-300 bg-red-100 text-red-800"
                          : "border-yellow-300 bg-yellow-100 text-yellow-800"
                      }
                    >
                      {req.status}
                    </Badge>

                    {req.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          disabled={isApproving}
                          onClick={() => approve(req._id)}
                          className="gap-1"
                        >
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
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This reason will be shown to the user who submitted the request.
            </p>
            <Textarea
              placeholder="e.g. Overlapping with an already approved shift"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || isRejecting}
              onClick={handleReject}
            >
              {isRejecting ? "Rejecting..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminWorkingHoursRequestsPage;
