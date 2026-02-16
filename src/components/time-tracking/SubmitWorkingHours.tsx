import { useState } from "react";
import { useSubmitWorkingHours } from "@/services/api/workingHours.api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Shift {
  startTime: string;
  endTime: string;
}

const SubmitWorkingHours = () => {
  const [day, setDay] = useState<string>("Monday");
  const [shifts, setShifts] = useState<Shift[]>([{ startTime: "", endTime: "" }]);
  const submitHours = useSubmitWorkingHours();

  const handleShiftChange = (index: number, field: "startTime" | "endTime", value: string) => {
    const newShifts = [...shifts];
    newShifts[index][field] = value;
    setShifts(newShifts);
  };

  const addShift = () => {
    if (shifts.length < 2) setShifts([...shifts, { startTime: "", endTime: "" }]);
  };

  const removeShift = (index: number) => {
    setShifts(shifts.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const valid = shifts.every(s => s.startTime && s.endTime);
    if (!valid) {
      toast.error("Please fill all shift times");
      return;
    }

    // ✅ Simple: Only send dayOfWeek and shifts
    submitHours.mutate({
      dayOfWeek: day,
      shifts
    });
  };

  return (
    <div className="border p-4 rounded-md space-y-4 bg-card">
      <h2 className="text-lg font-semibold">Submit Working Hours</h2>

      <Select value={day} onValueChange={setDay}>
        <SelectTrigger>
          <SelectValue placeholder="Select Day" />
        </SelectTrigger>
        <SelectContent>
          {daysOfWeek.map(d => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {shifts.map((shift, idx) => (
        <div key={idx} className="flex items-center space-x-2">
          <Input
            type="time"
            value={shift.startTime}
            onChange={e => handleShiftChange(idx, "startTime", e.target.value)}
          />
          <span>to</span>
          <Input
            type="time"
            value={shift.endTime}
            onChange={e => handleShiftChange(idx, "endTime", e.target.value)}
          />
          {shifts.length > 1 && (
            <Button variant="destructive" onClick={() => removeShift(idx)}>Remove</Button>
          )}
        </div>
      ))}

      {shifts.length < 2 && (
        <Button variant="outline" onClick={addShift}>Add Shift</Button>
      )}

      <Button onClick={handleSubmit} disabled={submitHours.isPending}>
        {submitHours.isPending ? "Submitting..." : "Submit Working Hours"}
      </Button>
    </div>
  );
};

export default SubmitWorkingHours;