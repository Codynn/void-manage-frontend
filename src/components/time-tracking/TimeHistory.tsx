import { useGetCheckInHistory } from "@/services/api/time.api";
import { useGetUserData } from "@/services/api/user.api";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Clock, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { DatePicker } from "../ui/date-picker";
import type { ITimeDataBase } from "@/types/time.type";
import { Skeleton } from "../ui/skeleton";

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

const TimeHistory = () => {
  const { data: userData } = useGetUserData();
  
  // Date filtering state
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();

  // Helper function to get date range based on filter
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);
    
    switch (dateFilter) {
      case "today":
        return {
          startDate: today.toISOString(), // Start of today (00:00:00)
          endDate: endOfToday.toISOString() // End of today (23:59:59.999)
        };
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return {
          startDate: yesterday.toISOString(),
          endDate: endOfYesterday.toISOString()
        };
      case "thisWeek":
        const startOfWeek = new Date(today);
        // Start of week (Monday)
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so 6 days back to Monday
        startOfWeek.setDate(today.getDate() - daysToMonday);
        return {
          startDate: startOfWeek.toISOString(),
          endDate: endOfToday.toISOString()
        };
      case "last7Days":
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 6); // 6 days ago + today = 7 days
        return {
          startDate: last7Days.toISOString(),
          endDate: endOfToday.toISOString()
        };
      case "thisMonth":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return {
          startDate: startOfMonth.toISOString(),
          endDate: endOfToday.toISOString()
        };
      case "last30Days":
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 29); // 29 days ago + today = 30 days
        return {
          startDate: last30Days.toISOString(),
          endDate: endOfToday.toISOString()
        };
      case "custom":
        return {
          startDate: customStartDate ? customStartDate.toISOString() : undefined,
          endDate: customEndDate ? customEndDate.toISOString() : undefined
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

  return (
    <Card className="bg-white border border-gray-300 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-800">Time Entries</CardTitle>
            <CardDescription className="text-gray-600">
              Your recent check-in and check-out history
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
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
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">From:</span>
              <DatePicker
                date={customStartDate}
                onDateChange={setCustomStartDate}
                placeholder="Start date"
                className="w-36"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">To:</span>
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
                className="text-xs text-gray-500 hover:text-gray-700 underline"
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
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-700">
                Showing entries for: {" "}
                {startDate && endDate && 
                 new Date(startDate).toLocaleDateString() === new Date(endDate).toLocaleDateString() ? (
                  <span className="font-medium">
                    {new Date(startDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="font-medium">
                      {startDate ? new Date(startDate).toLocaleDateString() : 'Start'}
                      {" → "} 
                      {endDate ? new Date(endDate).toLocaleDateString() : 'End'}
                  </span>
                )}
              </p>
              {checkInHistory?.items && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
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
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600">No time entries found</p>
            </div>
          ) : (
            [...(checkInHistory?.items || [])]
              .sort((a: ITimeDataBase, b: ITimeDataBase) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
              .map((entry: ITimeDataBase) => (
              <div
                key={entry?._id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-800 font-medium">
                      {new Date(entry?.checkInTime).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  </div>
                </div>
                <div className="text-right">
                  {entry?.checkOutTime ? (
                    <span className="text-gray-800 font-medium">
                      {formatDuration(entry?.durationHours || 0)}
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
  );
};

export default TimeHistory;
