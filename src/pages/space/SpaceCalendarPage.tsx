import { useEffect, useMemo, useState } from "react";
import { format, addDays, parseISO } from "date-fns";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  History,
  Users,
} from "lucide-react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  useGetRooms,
  useGetSpaces,
  useGetSpaceAvailability,
  useCreateAllocation,
  useCancelAllocation,
  useCreateRoutine,
  useDeleteRoutine,
  useRelocateRoutineOccurrence,
  useCreateRoom,
  useCreateSpace,
  useGetSpaceAuditLog,
} from "@/services/api/space.api";
import { useGetUserData } from "@/services/api/user.api";
import type {
  IRoom,
  ISpace,
  ISpaceAvailabilityBlock,
  DayOfWeek,
} from "@/types/space.type";

const DAY_NAMES: DayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Day view configuration.
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_MINUTES = 60;

const todayStr = () => format(new Date(), "yyyy-MM-dd");

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const fmtHHMM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const colorForUser = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue} 65% 55%)`;
};

// -----------------------------------------------------------------------
// Space card: one bookable space's day view
// -----------------------------------------------------------------------

type SpaceCardProps = {
  space: ISpace;
  date: string;
  currentUserId: string;
  isAdmin: boolean;
};

const SpaceCard = ({ space, date, currentUserId, isAdmin }: SpaceCardProps) => {
  const { data: availability, isLoading } = useGetSpaceAvailability(space._id, date);
  const { mutate: createAllocation, isPending: creating } = useCreateAllocation();
  const { mutate: createRoutine } = useCreateRoutine();
  const { mutate: cancelAllocation } = useCancelAllocation();
  const { mutate: deleteRoutine } = useDeleteRoutine();
  const { mutate: relocateOccurrence } = useRelocateRoutineOccurrence();

  const [bookingSlot, setBookingSlot] = useState<{ start: string; end: string } | null>(null);
  const [purpose, setPurpose] = useState("");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ISpaceAvailabilityBlock | null>(null);
  const [dragRange, setDragRange] = useState<{ anchor: number; cursor: number } | null>(null);

  const busy = availability?.busy || [];
  const dayName = availability?.dayName || DAY_NAMES[parseISO(date).getDay()];

  // Build a dense per-hour grid for the day window. Each cell is a fixed
  // SLOT_MINUTES slot and references the busy block (if any) overlapping it.
  type Slot = {
    start: number;
    end: number;
    busyBlock?: ISpaceAvailabilityBlock;
    busyLabel?: boolean; // true on the slot that should render the block's label
  };
  const gridSlots = useMemo<Slot[]>(() => {
    const dayStart = DAY_START_HOUR * 60;
    const dayEnd = DAY_END_HOUR * 60;
    const slots: Slot[] = [];
    for (let s = dayStart; s < dayEnd; s += SLOT_MINUTES) {
      const slot: Slot = { start: s, end: s + SLOT_MINUTES };
      const block = busy.find((b) => {
        const bs = toMinutes(b.startTime);
        const be = b.endTime === "(open)" ? dayEnd : toMinutes(b.endTime);
        return bs < slot.end && be > slot.start;
      });
      if (block) slot.busyBlock = block;
      slots.push(slot);
    }
    // Mark the first slot of each contiguous busy block for the label.
    for (let i = 0; i < slots.length; i++) {
      const b = slots[i].busyBlock;
      if (b && (i === 0 || slots[i - 1].busyBlock !== b)) slots[i].busyLabel = true;
    }
    return slots;
  }, [busy]);

  // Returns the contiguous free selection anchored at `anchor` and extended
  // toward `cursor`, truncated at the first busy slot so a drag can't cross
  // a booking.
  const resolveDragRange = (anchor: number, cursor: number) => {
    if (!gridSlots[anchor] || gridSlots[anchor].busyBlock) return null;
    const dir = cursor >= anchor ? 1 : -1;
    let start = anchor;
    let end = anchor;
    if (dir === 1) {
      for (let i = anchor + 1; i <= cursor; i++) {
        if (!gridSlots[i] || gridSlots[i].busyBlock) break;
        end = i;
      }
    } else {
      for (let i = anchor - 1; i >= cursor; i--) {
        if (!gridSlots[i] || gridSlots[i].busyBlock) break;
        start = i;
      }
    }
    return { start, end };
  };

  const openBookingFromRange = (anchor: number, cursor: number) => {
    const r = resolveDragRange(anchor, cursor);
    if (!r) return;
    const startMin = gridSlots[r.start].start;
    const endMin = gridSlots[r.end].end;
    setBookingSlot({ start: fmtHHMM(startMin), end: fmtHHMM(endMin) });
    setPurpose("");
    setRepeatWeekly(false);
  };

  // Global mouseup/touchend so the drag always finalizes even if the pointer
  // leaves the grid before release. Mouseenter handles the drag extension
  // natively — no pointer capture needed.
  useEffect(() => {
    if (!dragRange) return;
    const finish = () => {
      setDragRange((cur) => {
        if (cur) openBookingFromRange(cur.anchor, cur.cursor);
        return null;
      });
    };
    window.addEventListener("mouseup", finish);
    window.addEventListener("touchend", finish);
    return () => {
      window.removeEventListener("mouseup", finish);
      window.removeEventListener("touchend", finish);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragRange]);

  const confirmBooking = () => {
    if (!bookingSlot) return;
    createAllocation(
      { space: space._id, date, startTime: bookingSlot.start, endTime: bookingSlot.end, purpose },
      {
        onSuccess: () => {
          if (repeatWeekly) {
            createRoutine({
              space: space._id,
              dayOfWeek: dayName,
              startTime: bookingSlot.start,
              endTime: bookingSlot.end,
              title: purpose || "Weekly booking",
            });
          }
          setBookingSlot(null);
        },
      }
    );
  };

  const activeRange = dragRange ? resolveDragRange(dragRange.anchor, dragRange.cursor) : null;

  const handleBlockClick = (block: ISpaceAvailabilityBlock) => {
    setSelectedBlock(block);
  };

  const cancelMyBooking = () => {
    if (!selectedBlock?.allocationId) return;
    cancelAllocation({ id: selectedBlock.allocationId }, { onSuccess: () => setSelectedBlock(null) });
  };

  const cancelMyRoutine = (mode: "today" | "all") => {
    if (!selectedBlock?.routineId) return;
    if (mode === "today") {
      relocateOccurrence(
        { id: selectedBlock.routineId, date, status: "cleared", note: "Skipped" },
        { onSuccess: () => setSelectedBlock(null) }
      );
    } else {
      deleteRoutine(selectedBlock.routineId, { onSuccess: () => setSelectedBlock(null) });
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{space.name}</span>
          {space.capacity ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {space.capacity}
            </span>
          ) : null}
        </CardTitle>
        {space.location ? (
          <p className="text-xs text-muted-foreground">{space.location}</p>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <div
            className="grid gap-px rounded-md overflow-hidden border bg-border select-none"
            style={{ gridTemplateColumns: "48px 1fr" }}
          >
            {gridSlots.map((slot, i) => {
              const inSelection =
                !!activeRange && i >= activeRange.start && i <= activeRange.end;
              const block = slot.busyBlock;
              const mine =
                block?.source === "allocation" && block.bookedBy?._id === currentUserId;
              const bg = block
                ? block.source === "routine"
                  ? "hsl(220 50% 55%)"
                  : block.bookedBy
                    ? colorForUser(block.bookedBy._id)
                    : "hsl(0 0% 55%)"
                : undefined;

              return (
                <div key={i} className="contents">
                  {/* Time label column */}
                  <div className="bg-muted/40 text-[10px] text-muted-foreground flex items-center justify-center font-mono">
                    {fmtHHMM(slot.start)}
                  </div>
                  {/* Slot cell */}
                  {block ? (
                    <button
                      type="button"
                      onClick={() => handleBlockClick(block)}
                      className="h-7 px-2 text-[11px] text-white text-left truncate hover:ring-2 hover:ring-foreground/30 transition"
                      style={{ background: bg, opacity: mine ? 1 : 0.92 }}
                      title={
                        block.source === "allocation"
                          ? `${block.title} · ${block.bookedBy?.username || "Unknown"}`
                          : `${block.title}${block.batch ? ` · ${block.batch}` : ""} (weekly)`
                      }
                    >
                      <span className="font-medium">
                        {block.source === "allocation"
                          ? block.bookedBy?.username || "Booked"
                          : block.title}
                        {block.source === "allocation" && slot.busyLabel && block.title
                          ? ` · ${block.title}`
                          : ""}
                        {block.source === "routine" && slot.busyLabel ? " · weekly" : ""}
                      </span>
                    </button>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setDragRange({ anchor: i, cursor: i });
                      }}
                      onMouseEnter={() => {
                        if (dragRange) setDragRange({ ...dragRange, cursor: i });
                      }}
                      onTouchStart={() => setDragRange({ anchor: i, cursor: i })}
                      onTouchMove={(e) => {
                        const t = e.touches[0];
                        const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
                        const idx = el?.dataset?.slotIdx;
                        if (idx && dragRange) setDragRange({ ...dragRange, cursor: Number(idx) });
                      }}
                      data-slot-idx={i}
                      className={`h-7 cursor-pointer transition ${
                        inSelection
                          ? "bg-primary/30 ring-1 ring-primary ring-inset"
                          : "bg-background hover:bg-primary/10"
                      }`}
                      style={{ touchAction: "none" }}
                      aria-label={`Book ${fmtHHMM(slot.start)}–${fmtHHMM(slot.end)}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* Live selection summary */}
        {activeRange && (
          <p className="text-xs text-primary mt-2 font-medium">
            {fmtHHMM(gridSlots[activeRange.start].start)} – {fmtHHMM(gridSlots[activeRange.end].end)}
            {" · "}
            {activeRange.end - activeRange.start + 1}h selected
          </p>
        )}
      </CardContent>

      {/* Booking confirmation dialog */}
      <Dialog open={!!bookingSlot} onOpenChange={(o) => !o && setBookingSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book {space.name}</DialogTitle>
            <DialogDescription>
              {bookingSlot?.start} – {bookingSlot?.end} · {format(parseISO(date), "EEE, MMM d")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor={`purpose-${space._id}`} className="text-xs">
                Purpose (optional)
              </Label>
              <Input
                id={`purpose-${space._id}`}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Deep work, meeting, ..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={repeatWeekly}
                onCheckedChange={(v) => setRepeatWeekly(!!v)}
              />
              <span>Repeat every {dayName} at this time</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBookingSlot(null)}>
              Cancel
            </Button>
            <Button onClick={confirmBooking} disabled={creating}>
              {creating ? "Booking..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Busy block detail dialog */}
      <Dialog open={!!selectedBlock} onOpenChange={(o) => !o && setSelectedBlock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBlock?.title}</DialogTitle>
            <DialogDescription>
              {space.name} · {selectedBlock?.startTime} – {selectedBlock?.endTime}
              {selectedBlock?.source === "routine" ? " · Weekly routine" : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm space-y-1">
            {selectedBlock?.source === "allocation" && (
              <>
                <p>
                  Booked by: <strong>{selectedBlock.bookedBy?.username || "—"}</strong>
                </p>
                <p>
                  Status: <Badge variant="outline">{selectedBlock.status}</Badge>
                </p>
              </>
            )}
            {selectedBlock?.source === "routine" && selectedBlock.batch ? (
              <p>Batch: {selectedBlock.batch}</p>
            ) : null}
          </div>
          <DialogFooter className="flex-wrap gap-2">
            {selectedBlock?.source === "allocation" &&
              (selectedBlock.bookedBy?._id === currentUserId || isAdmin) && (
                <Button variant="destructive" onClick={cancelMyBooking}>
                  Cancel booking
                </Button>
              )}
            {selectedBlock?.source === "routine" && (
              <>
                <Button variant="outline" onClick={() => cancelMyRoutine("today")}>
                  Skip today
                </Button>
                <Button variant="destructive" onClick={() => cancelMyRoutine("all")}>
                  End routine
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setSelectedBlock(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// -----------------------------------------------------------------------
// Admin: inline room / space creation dialogs
// -----------------------------------------------------------------------

const AddRoomDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const { mutate: createRoom, isPending } = useCreateRoom();
  const submit = () => {
    if (!name.trim()) return;
    createRoom({ name: name.trim(), location: location.trim() || undefined }, {
      onSuccess: () => {
        setName("");
        setLocation("");
        onOpenChange(false);
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add room</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ground floor" />
          </div>
          <div className="space-y-1">
            <Label>Location (optional)</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={isPending || !name.trim()}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AddSpaceDialog = ({
  open,
  onOpenChange,
  roomId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  roomId?: string | null;
}) => {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const { mutate: createSpace, isPending } = useCreateSpace();
  const submit = () => {
    if (!name.trim()) return;
    createSpace(
      {
        name: name.trim(),
        location: location.trim() || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        room: roomId || null,
      },
      {
        onSuccess: () => {
          setName("");
          setCapacity("");
          setLocation("");
          onOpenChange(false);
        },
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add space</DialogTitle>
          <DialogDescription>Added to the current room tab.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Desk 3" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Capacity</Label>
              <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={isPending || !name.trim()}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// -----------------------------------------------------------------------
// Audit log drawer (admin only)
// -----------------------------------------------------------------------

const AuditLogDrawer = () => {
  const { data: logs } = useGetSpaceAuditLog();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <History className="h-4 w-4" />
          Activity
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Activity log</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {(logs || []).map((log: any) => (
            <div key={log._id} className="text-sm border rounded p-2">
              <div className="flex justify-between">
                <strong>{log.action}</strong>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(log.createdAt), "MMM d, HH:mm")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {log.entityType} · {log.performedBy?.username || "system"}
              </div>
              {log.message ? <div className="text-xs mt-1">{log.message}</div> : null}
            </div>
          ))}
          {!logs?.length && <p className="text-sm text-muted-foreground">No activity yet.</p>}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// -----------------------------------------------------------------------
// Main page
// -----------------------------------------------------------------------

const UNGROUPED = "__ungrouped__";

const SpaceCalendarPage = () => {
  const { data: user } = useGetUserData();
  const isAdmin = user?.role === "ADMIN";

  const { data: rooms } = useGetRooms("active");
  const { data: spaces } = useGetSpaces("active");
  const [date, setDate] = useState(todayStr());
  const [activeRoom, setActiveRoom] = useState<string>("");
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [addSpaceOpen, setAddSpaceOpen] = useState(false);

  const roomList: IRoom[] = rooms || [];
  const spaceList: ISpace[] = spaces || [];

  const ungroupedSpaces = spaceList.filter((s) => !s.room);
  const tabs = useMemo(() => {
    const t = roomList.map((r) => ({ id: r._id, name: r.name }));
    if (ungroupedSpaces.length) t.push({ id: UNGROUPED, name: "Unassigned" });
    return t;
  }, [roomList, ungroupedSpaces.length]);

  const currentTab = activeRoom || tabs[0]?.id || "";
  const spacesInTab =
    currentTab === UNGROUPED
      ? ungroupedSpaces
      : spaceList.filter(
          (s) => (typeof s.room === "object" ? s.room?._id : s.room) === currentTab
        );

  const shift = (days: number) =>
    setDate(format(addDays(parseISO(date), days), "yyyy-MM-dd"));

  return (
    <main className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <TitleHeader
          title="Spaces"
          description="Pick a free slot to book it — tick repeat to book every week at the same time."
        />
        <div className="flex items-center gap-2">
          {isAdmin && <AuditLogDrawer />}
        </div>
      </div>

      {/* Date bar */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => shift(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-44"
        />
        <Button variant="outline" size="icon" onClick={() => shift(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setDate(todayStr())}>
          Today
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          {format(parseISO(date), "EEEE, MMMM d, yyyy")}
        </span>
      </div>

      {/* Room tabs */}
      <div className="flex items-center gap-1 border-b overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveRoom(t.id)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition ${
              currentTab === t.id
                ? "border-primary text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.name}
          </button>
        ))}
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 gap-1"
            onClick={() => setAddRoomOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Room
          </Button>
        )}
      </div>

      {/* Space cards grid */}
      {!tabs.length ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No rooms or spaces yet.
            {isAdmin ? " Click \"+ Room\" above to begin." : ""}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spacesInTab.map((space) => (
            <SpaceCard
              key={space._id}
              space={space}
              date={date}
              currentUserId={user?._id || ""}
              isAdmin={isAdmin}
            />
          ))}
          {isAdmin && currentTab !== UNGROUPED && (
            <button
              type="button"
              onClick={() => setAddSpaceOpen(true)}
              className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground hover:text-foreground hover:border-primary transition min-h-[200px]"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add space to this room</span>
            </button>
          )}
        </div>
      )}

      <AddRoomDialog open={addRoomOpen} onOpenChange={setAddRoomOpen} />
      <AddSpaceDialog
        open={addSpaceOpen}
        onOpenChange={setAddSpaceOpen}
        roomId={currentTab === UNGROUPED ? null : currentTab}
      />
    </main>
  );
};

export default SpaceCalendarPage;
