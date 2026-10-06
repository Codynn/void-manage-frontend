import { useState } from "react";
import { FlagTriangleRight, FlagOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToggleFlagCheckIn } from "@/services/api/time.api";
import type { ITimeDataBase } from "@/types/time.type";

// Admin/mentor control to mark a check-in as invalid (e.g. checked in without
// coming in, or an extra check-in with no actual work) - excludes its hours
// from the user's total. Clicking again clears the flag.
const FlagCheckInButton = ({ entry }: { entry: ITimeDataBase }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { mutate: toggleFlag, isPending } = useToggleFlagCheckIn();

  if (entry.flagged) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        disabled={isPending}
        onClick={() => toggleFlag({ sessionId: entry._id, flagged: false })}
      >
        <FlagOff className="h-3 w-3" />
        Clear Flag
      </Button>
    );
  }

  const handleFlag = () => {
    if (!reason.trim()) return;
    toggleFlag(
      { sessionId: entry._id, flagged: true, reason: reason.trim() },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 gap-1.5 text-xs text-destructive hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <FlagTriangleRight className="h-3 w-3" />
        Flag
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag Check-In as Invalid</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This removes {entry.durationHours ? `${entry.durationHours}h` : "this entry's hours"} from
          the user's total worked hours. e.g. they checked in without coming to the office, or made an
          extra check-in with no actual work.
        </p>
        <Textarea
          placeholder="Reason for flagging..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={!reason.trim() || isPending} onClick={handleFlag}>
            {isPending ? "Flagging..." : "Flag as Invalid"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlagCheckInButton;
