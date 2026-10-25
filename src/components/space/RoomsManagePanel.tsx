import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Building2, Pencil, Archive } from "lucide-react";
import { useGetRooms, useCreateRoom, useUpdateRoom, useArchiveRoom } from "@/services/api/space.api";
import type { IRoom } from "@/types/space.type";

// Room is a plain categorization label - a single room can group many spaces.
const RoomsManagePanel = () => {
  const { data: rooms, isLoading } = useGetRooms();
  const { mutate: createRoom, isPending: isCreating } = useCreateRoom();
  const { mutate: updateRoom, isPending: isUpdating } = useUpdateRoom();
  const { mutate: archiveRoom } = useArchiveRoom();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IRoom | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setCode("");
    setLocation("");
    setOpen(true);
  };

  const openEdit = (room: IRoom) => {
    setEditing(room);
    setName(room.name);
    setCode(room.code || "");
    setLocation(room.location || "");
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    const data = { name, code, location };
    if (editing) updateRoom({ id: editing._id, ...data }, { onSuccess: () => setOpen(false) });
    else createRoom(data, { onSuccess: () => setOpen(false) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Rooms are just a grouping label - attach spaces to a room from the Spaces tab.
        </p>
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Room
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : !rooms?.length ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Building2 className="mx-auto mb-3 h-10 w-10" />
            No rooms yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room: IRoom) => (
            <Card key={room._id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    {room.location && <p className="text-xs text-muted-foreground">{room.location}</p>}
                  </div>
                  <Badge variant="outline">{room.status}</Badge>
                </div>
                {room.code && <Badge variant="secondary">{room.code}</Badge>}
                <div className="flex gap-2 border-t pt-2">
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => openEdit(room)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-destructive"
                    onClick={() => archiveRoom(room._id)}
                  >
                    <Archive className="h-3.5 w-3.5" />
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Room" : "New Room"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 2nd Floor East Wing" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., 2F-E" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Main Building" />
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

export default RoomsManagePanel;
