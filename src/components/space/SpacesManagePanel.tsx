import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, DoorOpen, Pencil, Archive } from "lucide-react";
import { useGetSpaces, useGetRooms, useCreateSpace, useUpdateSpace, useArchiveSpace } from "@/services/api/space.api";
import type { ISpace } from "@/types/space.type";

const NONE = "__none__";

const SpacesManagePanel = () => {
  const { data: spaces, isLoading } = useGetSpaces();
  const { data: rooms } = useGetRooms();
  const { mutate: createSpace, isPending: isCreating } = useCreateSpace();
  const { mutate: updateSpace, isPending: isUpdating } = useUpdateSpace();
  const { mutate: archiveSpace } = useArchiveSpace();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ISpace | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [room, setRoom] = useState(NONE);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setCode("");
    setLocation("");
    setCapacity("");
    setRoom(NONE);
    setOpen(true);
  };

  const openEdit = (space: ISpace) => {
    setEditing(space);
    setName(space.name);
    setCode(space.code || "");
    setLocation(space.location || "");
    setCapacity(space.capacity ? String(space.capacity) : "");
    const roomId = typeof space.room === "object" ? space.room?._id : space.room;
    setRoom(roomId || NONE);
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const data = {
      name,
      code,
      location,
      capacity: capacity ? Number(capacity) : undefined,
      room: room === NONE ? null : room,
    };
    if (editing) updateSpace({ id: editing._id, ...data }, { onSuccess: () => setOpen(false) });
    else createSpace(data, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Space
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !spaces?.length ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <DoorOpen className="mx-auto mb-3 h-10 w-10" />
            No spaces yet. Create one to start taking bookings.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => {
            const roomObj = typeof space.room === "object" ? space.room : null;
            return (
              <Card key={space._id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{space.name}</p>
                      {space.location && <p className="text-xs text-muted-foreground">{space.location}</p>}
                    </div>
                    <Badge variant="outline">{space.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    {roomObj && <Badge variant="secondary">{roomObj.name}</Badge>}
                    {space.code && <Badge variant="secondary">{space.code}</Badge>}
                    {space.capacity ? <Badge variant="secondary">Capacity {space.capacity}</Badge> : null}
                  </div>
                  <div className="flex gap-2 border-t pt-2">
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => openEdit(space)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-destructive"
                      onClick={() => archiveSpace(space._id)}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
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
            <DialogTitle>{editing ? "Edit Space" : "New Space"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Desk 14" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Room (category)</Label>
              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>None</SelectItem>
                  {rooms?.map((r: { _id: string; name: string }) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Code</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., D-14" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Capacity</Label>
                <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., 2nd Floor" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!name.trim() || isCreating || isUpdating} onClick={handleSubmit}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpacesManagePanel;
