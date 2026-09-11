import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGetWeeklyAttendance } from "@/services/api/time.api";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const UserCardsView = () => {
  const [filterRole, setFilterRole] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetWeeklyAttendance();
  const users = data?.users || [];

  const toggleCard = (userId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatTimeOnly = (isoString: string) =>
    new Date(isoString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter((user) => filterRole === "all" || user.userRole === filterRole);
  const roles = Array.from(new Set(users.map((u) => u.userRole)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {data?.weekStart && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Week of:</span>
            <Badge variant="outline">{format(new Date(data.weekStart), "MMM dd, yyyy")}</Badge>
          </div>
        )}
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isExpanded = expandedCards.has(user.userId);
          const totalWeeklyHours = daysOfWeek.reduce(
            (sum, day) => sum + (user.days[day] || []).reduce((s, e) => s + (e.hours || 0), 0),
            0
          );

          return (
            <Card
              key={user.userId}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => toggleCard(user.userId)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.userName}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {user.userRole}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {daysOfWeek.map((day) => {
                    const entries = user.days[day] || [];

                    return (
                      <div key={day} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-muted-foreground w-16">{day.slice(0, 3)}:</span>
                        {entries.length > 0 ? (
                          <div className="flex-1">
                            {entries.map((entry, idx) => (
                              <div key={idx} className="flex items-center justify-between">
                                <span className="text-foreground">
                                  {formatTimeOnly(entry.checkInTime)} -{" "}
                                  {entry.checkOutTime ? formatTimeOnly(entry.checkOutTime) : "Active"}
                                </span>
                                {isExpanded && entry.hours != null && (
                                  <Badge variant="outline" className="text-xs ml-2">
                                    {entry.hours.toFixed(1)}h
                                  </Badge>
                                )}
                              </div>
                            ))}
                            {entries.length > 1 && !isExpanded && (
                              <span className="text-xs text-muted-foreground ml-2">
                                +{entries.length - 1} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex-1">Off</span>
                        )}
                      </div>
                    );
                  })}

                  {isExpanded && (
                    <div className="pt-3 mt-3 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">Total Weekly Hours:</span>
                        <Badge>{totalWeeklyHours.toFixed(1)}h</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No users found for the selected filters.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserCardsView;
