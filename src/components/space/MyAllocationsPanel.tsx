import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarClock, X, Pencil } from "lucide-react";
import { useGetMyAllocations, useCancelAllocation, useUpdateAllocation } from "@/services/api/space.api";
import type { ISpaceAllocation } from "@/types/space.type";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-300",
};

const MyAllocationsPanel = () => {
  const { data: allocations, isLoading } = useGetMyAllocations();
  const { mutate: cancelAllocation } = useCancelAllocation();
  const { mutate: updateAllocation, isPending: isRescheduling } = useUpdateAllocation();

  const [rescheduling, setRescheduling] = useState<ISpaceAllocation | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const openReschedule = (a: ISpaceAllocation) => {
    setRescheduling(a);
    setDate(a.date);
    setStartTime(a.startTime);
    setEndTime(a.endTime || "");
  };

  const submitReschedule = () => {
    if (!rescheduling) return;
    updateAllocation(
      { id: rescheduling._id, date, startTime, endTime },
      { onSuccess: () => setRescheduling(null) }
    );
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
  if (!allocations?.length) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <CalendarClock className="mx-auto mb-3 h-10 w-10" />
          You haven't booked a space yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {allocations.map((a: ISpaceAllocation) => {
        const space = typeof a.space === "object" ? a.space : null;
        const canChange = a.status === "PENDING" || a.status === "REJECTED";
        return (
          <Card key={a._id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{space?.name || "Space"}</span>
                  <Badge variant="outline" className={STATUS_COLOR[a.status]}>
                    {a.status}
                  </Badge>
                  {a.overridden && <Badge variant="outline">Admin override</Badge>}
                  {a.allocationType === "DEFAULT" && <Badge variant="outline">Default space</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {a.date}, {a.startTime} - {a.endTime || "open"}
                  {a.purpose ? ` - ${a.purpose}` : ""}
                </p>
                {a.status === "REJECTED" && a.rejectionReason && (
                  <p className="mt-1 text-xs text-red-700">Reason: {a.rejectionReason}</p>
                )}
              </div>
              {canChange && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openReschedule(a)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Reschedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive"
                    onClick={() => cancelAllocation({ id: a._id })}
                  >
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              )}
              {a.status === "APPROVED" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-destructive"
                  onClick={() => cancelAllocation({ id: a._id })}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!rescheduling} onOpenChange={(open) => !open && setRescheduling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduling(null)}>
              Cancel
            </Button>
            <Button disabled={isRescheduling} onClick={submitReschedule}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAllocationsPanel;
