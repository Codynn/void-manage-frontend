import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, ShieldAlert, Undo2, Shuffle, ClipboardList } from "lucide-react";
import {
  useGetAllAllocations,
  useApproveAllocation,
  useRejectAllocation,
  useOverrideAllocation,
  useRestoreAllocation,
  useSwapAllocations,
} from "@/services/api/space.api";
import type { ISpaceAllocation } from "@/types/space.type";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
  CANCELLED: "bg-gray-100 text-gray-600 border-gray-300",
};

interface Props {
  isAdmin: boolean;
}

const ManageAllocationsPanel = ({ isAdmin }: Props) => {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const { data: allocations, isLoading } = useGetAllAllocations(
    statusFilter === "ALL" ? {} : { status: statusFilter }
  );

  const { mutate: approve } = useApproveAllocation();
  const { mutate: reject } = useRejectAllocation();
  const { mutate: override } = useOverrideAllocation();
  const { mutate: restore } = useRestoreAllocation();
  const { mutate: swap, isPending: isSwapping } = useSwapAllocations();

  const [rejecting, setRejecting] = useState<ISpaceAllocation | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [swapMode, setSwapMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-2)));
  };

  const doSwap = () => {
    if (selected.length !== 2) return;
    swap(
      { allocationAId: selected[0], allocationBId: selected[1] },
      { onSuccess: () => { setSelected([]); setSwapMode(false); } }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="ALL">All</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          {swapMode && (
            <Button size="sm" disabled={selected.length !== 2 || isSwapping} onClick={doSwap}>
              Swap selected ({selected.length}/2)
            </Button>
          )}
          <Button
            size="sm"
            variant={swapMode ? "default" : "outline"}
            className="gap-1.5"
            onClick={() => {
              setSwapMode((v) => !v);
              setSelected([]);
            }}
          >
            <Shuffle className="h-3.5 w-3.5" />
            {swapMode ? "Cancel swap" : "Swap two bookings"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !allocations?.length ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-3 h-10 w-10" />
            No bookings here.
          </CardContent>
        </Card>
      ) : (
        allocations.map((a: ISpaceAllocation) => {
          const space = typeof a.space === "object" ? a.space : null;
          const user = typeof a.bookedBy === "object" ? a.bookedBy : null;
          return (
            <Card key={a._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  {swapMode && (
                    <Checkbox
                      checked={selected.includes(a._id)}
                      onCheckedChange={() => toggleSelect(a._id)}
                      className="mt-1"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{space?.name || "Space"}</span>
                      <Badge variant="outline" className={STATUS_COLOR[a.status]}>
                        {a.status}
                      </Badge>
                      {a.overridden && <Badge variant="outline">Override</Badge>}
                      {a.allocationType === "DEFAULT" && <Badge variant="outline">Default space</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {a.date}, {a.startTime} - {a.endTime || "open"} - {user?.username} ({user?.email})
                    </p>
                    {a.purpose && <p className="text-xs text-muted-foreground">{a.purpose}</p>}
                  </div>
                </div>

                {!swapMode && (
                  <div className="flex flex-wrap gap-2">
                    {a.status === "PENDING" && (
                      <>
                        <Button size="sm" className="gap-1.5" onClick={() => approve(a._id)}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
                          onClick={() => setRejecting(a)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                    {a.status !== "APPROVED" && isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => override({ id: a._id })}
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Override & Approve
                      </Button>
                    )}
                    {a.status === "APPROVED" && (
                      <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => setRejecting(a)}>
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    )}
                    {a.history?.length > 0 && (
                      <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => restore(a._id)}>
                        <Undo2 className="h-3.5 w-3.5" />
                        Restore previous
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Booking</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (!rejecting) return;
                reject({ id: rejecting._id, reason: rejectReason.trim() }, { onSuccess: () => setRejecting(null) });
                setRejectReason("");
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageAllocationsPanel;
