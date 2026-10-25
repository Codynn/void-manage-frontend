import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Upload, CalendarOff, CalendarSync, Trash2, Table2 } from "lucide-react";
import {
  useGetSpaces,
  useGetRoutines,
  useCreateRoutine,
  useDeleteRoutine,
  useImportRoutines,
  useRelocateRoutineOccurrence,
  useRestoreRoutineOccurrence,
} from "@/services/api/space.api";
import type { DayOfWeek, ISpaceRoutine } from "@/types/space.type";

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SpaceRoutinesManagePanel = () => {
  const { data: spaces } = useGetSpaces("active");
  const [spaceFilter, setSpaceFilter] = useState<string>("");
  const { data: routines, isLoading } = useGetRoutines(spaceFilter ? { space: spaceFilter } : {});

  const { mutate: createRoutine, isPending: isCreating } = useCreateRoutine();
  const { mutate: deleteRoutine } = useDeleteRoutine();
  const { mutate: importRoutines, isPending: isImporting } = useImportRoutines();
  const { mutate: relocate, isPending: isRelocating } = useRelocateRoutineOccurrence();
  const { mutate: restoreOccurrence } = useRestoreRoutineOccurrence();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [space, setSpace] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [title, setTitle] = useState("");
  const [batch, setBatch] = useState("");

  const openCreate = () => {
    setSpace(spaceFilter || "");
    setDayOfWeek("Monday");
    setStartTime("");
    setEndTime("");
    setTitle("");
    setBatch("");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!space || !title || !startTime || !endTime) return;
    createRoutine({ space, dayOfWeek, startTime, endTime, title, batch }, { onSuccess: () => setOpen(false) });
  };

  const [relocating, setRelocating] = useState<ISpaceRoutine | null>(null);
  const [occDate, setOccDate] = useState("");
  const [occStatus, setOccStatus] = useState<"moved" | "cleared">("cleared");
  const [occSpace, setOccSpace] = useState("");
  const [occStart, setOccStart] = useState("");
  const [occEnd, setOccEnd] = useState("");
  const [occNote, setOccNote] = useState("");

  const openRelocate = (routine: ISpaceRoutine) => {
    setRelocating(routine);
    setOccDate("");
    setOccStatus("cleared");
    setOccSpace(typeof routine.space === "object" ? routine.space._id : routine.space);
    setOccStart(routine.startTime);
    setOccEnd(routine.endTime);
    setOccNote("");
  };

  const submitRelocate = () => {
    if (!relocating || !occDate) return;
    relocate(
      {
        id: relocating._id,
        date: occDate,
        status: occStatus,
        relocatedSpace: occStatus === "moved" ? occSpace : undefined,
        relocatedStartTime: occStatus === "moved" ? occStart : undefined,
        relocatedEndTime: occStatus === "moved" ? occEnd : undefined,
        note: occNote,
      },
      { onSuccess: () => setRelocating(null) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={spaceFilter || "all"} onValueChange={(v) => setSpaceFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All spaces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All spaces</SelectItem>
            {spaces?.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importRoutines(file);
              e.target.value = "";
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            {isImporting ? "Importing..." : "Import Batch"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Add Routine
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Import columns: space, dayOfWeek, startTime, endTime, title, batch (optional).
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !routines?.length ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Table2 className="mx-auto mb-3 h-10 w-10" />
            No routines yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {routines.map((routine: ISpaceRoutine) => {
            const spaceObj = typeof routine.space === "object" ? routine.space : null;
            return (
              <Card key={routine._id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{routine.dayOfWeek}</Badge>
                      <span className="font-medium">{routine.title}</span>
                      {routine.batch && <Badge variant="secondary">{routine.batch}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {spaceObj?.name} - {routine.startTime} - {routine.endTime}
                    </p>
                    {routine.dateOverrides?.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {routine.dateOverrides.map((o) => (
                          <Badge
                            key={o._id || o.date}
                            variant="outline"
                            className="cursor-pointer gap-1 text-[10px]"
                            onClick={() => restoreOccurrence({ id: routine._id, date: o.date })}
                            title="Click to restore this date"
                          >
                            {o.date}: {o.status} (click to restore)
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openRelocate(routine)}>
                      <CalendarSync className="h-3.5 w-3.5" />
                      Relocate a date
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-destructive"
                      onClick={() => deleteRoutine(routine._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Routine</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Space *</Label>
              <Select value={space} onValueChange={setSpace}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a space" />
                </SelectTrigger>
                <SelectContent>
                  {spaces?.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Day of week *</Label>
              <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Start time *</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End time *</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Frontend Batch 3" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Batch / notes</Label>
              <Input value={batch} onChange={(e) => setBatch(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!space || !title || !startTime || !endTime || isCreating}
              onClick={handleSubmit}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!relocating} onOpenChange={(o) => !o && setRelocating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relocate / Clear One Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Only affects this specific date - the constant weekly routine stays unchanged.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs">Date *</Label>
              <Input type="date" value={occDate} onChange={(e) => setOccDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Action</Label>
              <Select value={occStatus} onValueChange={(v) => setOccStatus(v as "moved" | "cleared")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleared">
                    <CalendarOff className="h-3.5 w-3.5" /> Clear this date (no class)
                  </SelectItem>
                  <SelectItem value="moved">
                    <CalendarSync className="h-3.5 w-3.5" /> Move this date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {occStatus === "moved" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">New space</Label>
                  <Select value={occSpace} onValueChange={setOccSpace}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces?.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">New start time</Label>
                    <Input type="time" value={occStart} onChange={(e) => setOccStart(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">New end time</Label>
                    <Input type="time" value={occEnd} onChange={(e) => setOccEnd(e.target.value)} />
                  </div>
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Input value={occNote} onChange={(e) => setOccNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRelocating(null)}>
              Cancel
            </Button>
            <Button disabled={!occDate || isRelocating} onClick={submitRelocate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpaceRoutinesManagePanel;
