import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useGetAllUsersWorkingHours } from "@/services/api/workingHours.api";
import { CalendarIcon, Loader2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type SortField = "user" | "role" | "startTime" | "totalHours";
type SortOrder = "asc" | "desc";

interface DayScheduleRow {
  userId: string;
  userName: string;
  userRole: string;
  shifts: { startTime: string; endTime: string }[];
  totalHours: number;
}

const DateTableView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sortField, setSortField] = useState<SortField>("user");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);

  const { data: workingHours, isLoading } = useGetAllUsersWorkingHours();

  const dayOfWeek = format(selectedDate, "EEEE"); // e.g., "Monday"

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateTotalHours = (shifts: { startTime: string; endTime: string }[]) => {
    let total = 0;
    shifts.forEach(shift => {
      const [startH, startM] = shift.startTime.split(":").map(Number);
      const [endH, endM] = shift.endTime.split(":").map(Number);
      total += (endH + endM / 60) - (startH + startM / 60);
    });
    return total;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Build table data for selected date
  const tableData: DayScheduleRow[] = (workingHours || [])
    .map(user => {
      const daySchedule = user.schedule[dayOfWeek];
      if (!daySchedule || daySchedule.length === 0) return null;

      return {
        userId: user.userId,
        userName: user.userName,
        userRole: user.userRole,
        shifts: daySchedule,
        totalHours: calculateTotalHours(daySchedule),
      };
    })
    .filter((row): row is DayScheduleRow => row !== null);

  // Sort data
  const sortedData = [...tableData].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case "user":
        compareValue = a.userName.localeCompare(b.userName);
        break;
      case "role":
        compareValue = a.userRole.localeCompare(b.userRole);
        break;
      case "startTime":
        compareValue = a.shifts[0].startTime.localeCompare(b.shifts[0].startTime);
        break;
      case "totalHours":
        compareValue = a.totalHours - b.totalHours;
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Badge variant="secondary" className="text-base px-4 py-2">
          {dayOfWeek}
        </Badge>

        <div className="ml-auto text-sm text-muted-foreground">
          {sortedData.length} user{sortedData.length !== 1 ? "s" : ""} scheduled
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schedules for {format(selectedDate, "MMMM dd, yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("user")}
                      className="h-8 px-2"
                    >
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("role")}
                      className="h-8 px-2"
                    >
                      Role
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("startTime")}
                      className="h-8 px-2"
                    >
                      Start
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("totalHours")}
                      className="h-8 px-2"
                    >
                      Total Hours
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Shifts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow
                    key={row.userId}
                    className={cn(
                      "cursor-pointer transition-colors",
                      hoveredUser === row.userId && "bg-muted/50"
                    )}
                    onMouseEnter={() => setHoveredUser(row.userId)}
                    onMouseLeave={() => setHoveredUser(null)}
                  >
                    <TableCell className="font-medium">{row.userName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.userRole}</Badge>
                    </TableCell>
                    <TableCell>{formatTime(row.shifts[0].startTime)}</TableCell>
                    <TableCell>
                      {formatTime(row.shifts[row.shifts.length - 1].endTime)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.totalHours.toFixed(1)} hrs</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {row.shifts.map((shift, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground">
                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              No users scheduled for {dayOfWeek}, {format(selectedDate, "MMMM dd, yyyy")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DateTableView;