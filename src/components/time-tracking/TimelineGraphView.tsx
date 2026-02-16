import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGetAllUsersWorkingHours } from "@/services/api/workingHours.api";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TimelineGraphView = () => {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [hoveredBlock, setHoveredBlock] = useState<{ userId: string; shift: any } | null>(null);

  const { data: workingHours, isLoading } = useGetAllUsersWorkingHours();

  const getTimeBlock = (time: string): number => {
    const [hours] = time.split(":").map(Number);
    return hours;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const filteredUsers = workingHours?.filter(user =>
    filterUser === "all" || user.userId === filterUser
  ) || [];

  const userNames = workingHours?.map(u => ({ id: u.userId, name: u.userName })) || [];

  // Work hours range (6 AM to 10 PM)
  const workHoursStart = 6;
  const workHoursEnd = 22;
  const displayHours = Array.from({ length: workHoursEnd - workHoursStart + 1 }, (_, i) => i + workHoursStart);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Day" />
          </SelectTrigger>
          <SelectContent>
            {daysOfWeek.map(day => (
              <SelectItem key={day} value={day}>{day}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by User" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {userNames.map(user => (
              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <span>Off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline - {selectedDay}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Time Header */}
            <div className="flex mb-4 sticky top-0 bg-card z-10">
              <div className="w-40 flex-shrink-0 font-medium text-sm">User</div>
              <div className="flex-1 flex">
                {displayHours.map(hour => (
                  <div
                    key={hour}
                    className="flex-1 text-center text-xs text-muted-foreground border-l first:border-l-0"
                  >
                    {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : hour === 0 ? "12 AM" : `${hour} AM`}
                  </div>
                ))}
              </div>
            </div>

            {/* User Rows */}
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const daySchedule = user.schedule[selectedDay];
                const hasShifts = daySchedule && daySchedule.length > 0;

                return (
                  <div key={user.userId} className="flex items-center group">
                    {/* User Info */}
                    <div className="w-40 flex-shrink-0 pr-4">
                      <div className="font-medium text-sm truncate">{user.userName}</div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {user.userRole}
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 relative h-12 border rounded-md bg-gray-50">
                      {displayHours.map((hour, idx) => (
                        <div
                          key={hour}
                          className="absolute border-l h-full"
                          style={{
                            left: `${(idx / displayHours.length) * 100}%`,
                          }}
                        />
                      ))}

                      {hasShifts ? (
                        daySchedule.map((shift, shiftIdx) => {
                          const startHour = getTimeBlock(shift.startTime);
                          const endHour = getTimeBlock(shift.endTime);
                          const [, startMinutes] = shift.startTime.split(":").map(Number);
                          const [, endMinutes] = shift.endTime.split(":").map(Number);

                          // Calculate position and width
                          const startDecimal = startHour + startMinutes / 60;
                          const endDecimal = endHour + endMinutes / 60;

                          const left = ((startDecimal - workHoursStart) / (workHoursEnd - workHoursStart + 1)) * 100;
                          const width = ((endDecimal - startDecimal) / (workHoursEnd - workHoursStart + 1)) * 100;

                          const isHovered = hoveredBlock?.userId === user.userId &&
                                          hoveredBlock?.shift === shift;

                          return (
                            <div
                              key={shiftIdx}
                              className={cn(
                                "absolute h-8 top-2 rounded bg-green-500 hover:bg-green-600 transition-colors cursor-pointer",
                                isHovered && "ring-2 ring-green-700 z-10"
                              )}
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}
                              onMouseEnter={() => setHoveredBlock({ userId: user.userId, shift })}
                              onMouseLeave={() => setHoveredBlock(null)}
                              title={`${user.userName}: ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}`}
                            >
                              <div className="text-white text-xs px-2 py-1 truncate">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                          Off
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No users found for the selected filters.
              </div>
            )}
          </div>

          {/* Hover Tooltip */}
          {hoveredBlock && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="text-sm">
                <span className="font-semibold">
                  {workingHours?.find(u => u.userId === hoveredBlock.userId)?.userName}
                </span>
                {" • "}
                <span>
                  {formatTime(hoveredBlock.shift.startTime)} - {formatTime(hoveredBlock.shift.endTime)}
                </span>
                {" • "}
                <span className="text-muted-foreground">
                  {(() => {
                    const [startH, startM] = hoveredBlock.shift.startTime.split(":").map(Number);
                    const [endH, endM] = hoveredBlock.shift.endTime.split(":").map(Number);
                    const hours = (endH + endM / 60) - (startH + startM / 60);
                    return `${hours.toFixed(1)} hours`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineGraphView;