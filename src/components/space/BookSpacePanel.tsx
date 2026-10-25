import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DoorOpen, Clock, LoaderCircle } from "lucide-react";
import { format } from "date-fns";
import { useGetSpaces, useGetSpaceAvailability, useCreateAllocation } from "@/services/api/space.api";

const todayStr = () => format(new Date(), "yyyy-MM-dd");

const BookSpacePanel = () => {
  const { data: spaces } = useGetSpaces("active");
  const [spaceId, setSpaceId] = useState<string>("");
  const [date, setDate] = useState(todayStr());
  const { data: availability, isLoading } = useGetSpaceAvailability(spaceId, date);

  const [showBookDialog, setShowBookDialog] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const { mutate: createAllocation, isPending } = useCreateAllocation();

  const handleBook = () => {
    if (!spaceId || !date || !startTime || !endTime) return;
    createAllocation(
      { space: spaceId, date, startTime, endTime, purpose },
      {
        onSuccess: () => {
          setShowBookDialog(false);
          setStartTime("");
          setEndTime("");
          setPurpose("");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DoorOpen className="h-4 w-4" />
            Check Availability
          </CardTitle>
          <CardDescription>Pick a space and date to see the schedule, then request a booking.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Space</Label>
            <Select value={spaceId} onValueChange={setSpaceId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Select a space" />
              </SelectTrigger>
              <SelectContent>
                {spaces?.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                    {s.location ? ` - ${s.location}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          </div>
          <Button type="button" disabled={!spaceId || !date} onClick={() => setShowBookDialog(true)} className="gap-2">
            Request Booking
          </Button>
        </CardContent>
      </Card>

      {spaceId && date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Schedule for {availability?.space?.name || "..."} on {date}
              {availability?.dayName ? ` (${availability.dayName})` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : !availability?.busy?.length ? (
              <p className="text-sm text-muted-foreground">No routines or bookings yet - the space is free all day.</p>
            ) : (
              availability.busy.map((block, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">
                      {block.startTime} - {block.endTime}
                    </span>
                    <span className="text-muted-foreground">{block.title}</span>
                    {block.batch && <Badge variant="outline">{block.batch}</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {block.source === "routine" ? (
                      <Badge variant="outline">Timetable{block.overridden ? ` (${block.overridden})` : ""}</Badge>
                    ) : (
                      <Badge
                        className={
                          block.status === "APPROVED"
                            ? "bg-green-500 text-white"
                            : "bg-yellow-500 text-white"
                        }
                      >
                        {block.status} - {block.bookedBy?.username}
                        {block.allocationType === "DEFAULT" ? " (default space)" : ""}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Space Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {availability?.space?.name} on {date}
            </p>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Purpose</Label>
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} placeholder="e.g. Team standup" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>
              Cancel
            </Button>
            <Button disabled={!startTime || !endTime || isPending} onClick={handleBook} className="gap-2">
              {isPending && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookSpacePanel;
