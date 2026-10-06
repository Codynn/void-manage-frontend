import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetMaxCheckInHours, useSetMaxCheckInHours } from "@/services/api/time.api";

// Global cap on a single check-in session before the system auto checks the
// user out, so a forgotten checkout never silently credits days of hours.
const MaxCheckInHoursSetting = () => {
  const { data: maxHours } = useGetMaxCheckInHours();
  const { mutate: setMaxHours, isPending } = useSetMaxCheckInHours();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (maxHours != null) setValue(String(maxHours));
  }, [maxHours]);

  const handleSave = () => {
    const parsed = Number(value);
    if (!parsed || parsed < 1) return;
    setMaxHours(parsed);
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
      <Clock3 className="h-4 w-4 text-muted-foreground" />
      <Label htmlFor="maxCheckInHours" className="text-sm whitespace-nowrap">
        Max check-in hours/day
      </Label>
      <Input
        id="maxCheckInHours"
        type="number"
        min={1}
        step={0.5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-20"
      />
      <Button size="sm" variant="outline" disabled={isPending} onClick={handleSave}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
};

export default MaxCheckInHoursSetting;
