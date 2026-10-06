import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useGetCheckInHistory } from "@/services/api/time.api";
import { useGetUserById } from "@/services/api/user.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, ArrowLeft, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { ITimeDataBase } from "@/types/time.type";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import PendingWorkingHoursRequests from "@/components/time-tracking/PendingWorkingHoursRequests";
import CheckInEntryBadges from "@/components/time-tracking/CheckInEntryBadges";
import FlagCheckInButton from "@/components/time-tracking/FlagCheckInButton";

// Formats a Date as YYYY-MM-DD using its *local* calendar date, unlike
// `.toISOString()` which converts to UTC first and can silently roll the
// date back a day for timezones ahead of UTC (e.g. Nepal, UTC+5:45).
const toDateString = (date: Date) => format(date, "yyyy-MM-dd");

const formatDuration = (hoursInput: number) => {
  const hours = Math.floor(hoursInput);
  const mins = Math.round((hoursInput - hours) * 60);
  return `${hours}h ${mins}m`;
};

function formatToTimeOnly(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const AdminTimeHistoryPage = () => {
  const { userId } = useParams();
  const { data: userData, isLoading: userLoading } = useGetUserById(userId);

  // Date filtering state
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        return {
          startDate: toDateString(today),
          endDate: toDateString(today)
        };
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: toDateString(yesterday),
          endDate: toDateString(yesterday)
        };
      case "thisWeek":
        const startOfWeek = new Date(today);
        // Start of week (Monday)
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
        startOfWeek.setDate(today.getDate() - daysToMonday);
        return {
          startDate: toDateString(startOfWeek),
          endDate: toDateString(today)
        };
      case "last7Days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
        return {
          startDate: toDateString(last7Days),
          endDate: toDateString(today)
        };
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: toDateString(startOfMonth),
          endDate: toDateString(today)
        };
      case "last30Days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29); // 29 days ago + today = 30 days
        return {
          startDate: toDateString(last30Days),
          endDate: toDateString(today)
        };
      case "custom":
        return {
          startDate: customStartDate ? toDateString(customStartDate) : undefined,
          endDate: customEndDate ? toDateString(customEndDate) : undefined
        };
      default:
        return {
          startDate: undefined,
          endDate: undefined
        };
    }
  };

  const { startDate, endDate } = getDateRange();

  const { data: checkInHistory, isLoading } = useGetCheckInHistory(
    userData?.username,
    startDate,
    endDate
  );

  const renderSkeleton = () => {
    return Array.from({ length: 3 }).map((_, idx) => (
      <div
        key={idx}
        className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
      >
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ));
  };

  if (userLoading) {
    return (
      <div className="bg-background p-6">
        <div className="">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-background p-6">
        <div className="">
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">User not found</p>
            <Link to="/users">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={`/admin/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Time Tracking History
            </h1>
            <p className="text-muted-foreground">
              Check-in/checkout history for{" "}
              <span className="font-medium text-foreground">
                {userData?.name || userData?.username}
              </span>
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="bg-card border-border">
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {userData?.username?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {userData?.name || userData?.username}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userData?.email}
                </p>
                <Badge variant="outline" className="mt-1">
                  {userData?.role?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Working Hours Requests */}
        <PendingWorkingHoursRequests userId={userData?._id} />

        {/* Time History Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Time Entries</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Check-in and check-out history for this user
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="last7Days">Last 7 Days</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="last30Days">Last 30 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {dateFilter === "custom" && (
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">From:</span>
                  <DatePicker
                    date={customStartDate}
                    onDateChange={setCustomStartDate}
                    placeholder="Start date"
                    className="w-36"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">To:</span>
                  <DatePicker
                    date={customEndDate}
                    onDateChange={setCustomEndDate}
                    placeholder="End date"
                    className="w-36"
                  />
                </div>
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => {
                      setCustomStartDate(undefined);
                      setCustomEndDate(undefined);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Show current date range */}
            {(startDate || endDate) && (
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary">
                    Showing entries for: {" "}
                    {startDate && endDate && startDate === endDate ? (
                      <span className="font-medium">{new Date(startDate).toLocaleDateString()}</span>
                    ) : (
                      <span className="font-medium">
                        {startDate ? new Date(startDate).toLocaleDateString() : 'Start'}
                        {" → "}
                        {endDate ? new Date(endDate).toLocaleDateString() : 'End'}
                      </span>
                    )}
                  </p>
                  {checkInHistory?.items && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                      {checkInHistory.items.length} entries
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {isLoading ? (
                renderSkeleton()
              ) : checkInHistory?.items?.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No time entries found</p>
                </div>
              ) : (
                checkInHistory?.items?.slice()?.map((entry: ITimeDataBase) => (
                  <div
                    key={entry?._id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-foreground font-medium">
                          {new Date(entry?.checkInTime).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatToTimeOnly(entry?.checkInTime)}</span>
                          {entry?.checkOutTime ? (
                            <>
                              <span>→</span>
                              <span>{formatToTimeOnly(entry?.checkOutTime)}</span>
                            </>
                          ) : (
                            <Badge className="bg-green-500 text-white ml-2">
                              Active
                            </Badge>
                          )}
                        </div>
                        <CheckInEntryBadges entry={entry} />
                      </div>
                      <FlagCheckInButton entry={entry} />
                    </div>
                    <div className="text-right">
                      {entry?.durationHours ? (
                        <span
                          className={`font-medium ${entry.flagged ? "text-muted-foreground line-through" : "text-foreground"}`}
                        >
                          {formatDuration(entry?.durationHours)}
                        </span>
                      ) : (
                        <span className="text-green-500 font-medium">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTimeHistoryPage;
