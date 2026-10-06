import { AlertTriangle, FlagTriangleRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ITimeDataBase } from "@/types/time.type";

// Shown next to a check-in entry wherever it's listed (intern's own history,
// admin's per-user history) - surfaces the two ways a session can diverge
// from a normal manual check-in/check-out.
const CheckInEntryBadges = ({ entry }: { entry: ITimeDataBase }) => {
  if (!entry.autoClosed && !entry.flagged) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
      {entry.autoClosed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700">
              <AlertTriangle className="h-3 w-3" />
              Auto Checked-Out
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{entry.autoCloseReason || "Reached the daily max hours"}</TooltipContent>
        </Tooltip>
      )}
      {entry.flagged && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1 border-red-300 bg-red-50 text-red-700">
              <FlagTriangleRight className="h-3 w-3" />
              Flagged
            </Badge>
          </TooltipTrigger>
          <TooltipContent>{entry.flagReason || "Flagged as invalid"}</TooltipContent>
        </Tooltip>
      )}
      </div>
    </TooltipProvider>
  );
};

export default CheckInEntryBadges;
