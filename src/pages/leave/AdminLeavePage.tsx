import { useState, useMemo } from "react";
import {
  useGetLeaveRequests,
  useUpdateLeaveStatus,
  useDeleteLeaveRequest,
} from "@/services/api/leave.api";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
  User,
  Search,
  FileText,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import type { ILeaveRequest } from "@/types/leave.type";
import { LEAVE_TYPE_LABELS, type LeaveType } from "@/types/leave.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
type FilterTimeframe = "ALL" | "THIS_WEEK" | "THIS_MONTH" | "LAST_MONTH";
type FilterLeaveType = "ALL" | LeaveType;

const AdminLeavePage = () => {
  const [filters, setFilters] = useState({
    status: "ALL" as FilterStatus,
    timeframe: "ALL" as FilterTimeframe,
    intern: "ALL" as string,
    leaveType: "ALL" as FilterLeaveType,
    search: "" as string,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const { data: leaveRequests, isLoading } = useGetLeaveRequests({
    ...filters,
    ...pagination,
  });
  const updateLeaveStatus = useUpdateLeaveStatus();
  const deleteLeaveRequest = useDeleteLeaveRequest();
  const queryClient = useQueryClient();

  const [selectedLeave, setSelectedLeave] = useState<ILeaveRequest | null>(
    null
  );

  // Update filters function
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({ page: 1, pageSize: newPageSize });
  };

  // Use the data directly from backend (already filtered)
  const filteredLeaveRequests = leaveRequests?.items || [];

  // Pagination info
  const paginationInfo = {
    totalItems: leaveRequests?.totalItems || 0,
    totalPages: leaveRequests?.totalPages || 0,
    currentPage: leaveRequests?.currentPage || 1,
    pageSize: leaveRequests?.pageSize || 10,
  };

  // Destructure for easier access
  const { totalItems, totalPages, currentPage, pageSize } = paginationInfo;

  // Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Summary statistics
  const stats = useMemo(() => {
    const items = leaveRequests?.items || [];
    const total = totalItems; // Use total from pagination
    const pending = items?.filter(
      (leave: ILeaveRequest) => leave.status === "PENDING"
    ).length;
    const approved = items?.filter(
      (leave: ILeaveRequest) => leave.status === "APPROVED"
    ).length;
    const rejected = items?.filter(
      (leave: ILeaveRequest) => leave.status === "REJECTED"
    ).length;
    const totalDays = items?.reduce(
      (sum: number, leave: ILeaveRequest) => sum + leave.days,
      0
    );
    const avgDays = total > 0 ? Math.round((totalDays / total) * 10) / 10 : 0;

    return { total, pending, approved, rejected, totalDays, avgDays };
  }, [leaveRequests?.items, totalItems]);

  // Unique interns for filter
  const uniqueInterns = useMemo(() => {
    const interns =
      leaveRequests?.items?.map((leave: ILeaveRequest) => leave.intern) || [];
    return interns.filter(
      (intern: any, index: number, self: any[]) =>
        index === self.findIndex((i: any) => i._id === intern._id)
    );
  }, [leaveRequests?.items]);

  const handleStatusUpdate = async (
    leaveId: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await updateLeaveStatus.mutateAsync({ leaveId, status });
      queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
    } catch (error) {
      console.error("Failed to update leave status:", error);
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this leave request? This action cannot be undone."
      )
    ) {
      try {
        await deleteLeaveRequest.mutateAsync(leaveId);
        queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      } catch (error) {
        console.error("Failed to delete leave request:", error);
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "APPROVED":
        return "default";
      case "REJECTED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <Card className="border border-gray-200 gap-0">
          <CardHeader className="pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    status: "ALL",
                    timeframe: "ALL",
                    intern: "ALL",
                    leaveType: "ALL",
                    search: "",
                  });
                  setPagination({ page: 1, pageSize: 10 });
                }}
                className="w-full h-10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              {/* Search Bar */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or reason..."
                    value={filters.search || ""}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    updateFilters({ status: value as FilterStatus })
                  }
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Timeframe
                </label>
                <Select
                  value={filters.timeframe}
                  onValueChange={(value) =>
                    updateFilters({ timeframe: value as FilterTimeframe })
                  }
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Time</SelectItem>
                    <SelectItem value="THIS_WEEK">This Week</SelectItem>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                    <SelectItem value="LAST_MONTH">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Intern
                </label>
                <Select
                  value={filters.intern}
                  onValueChange={(value) => updateFilters({ intern: value })}
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select intern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Interns</SelectItem>
                    {uniqueInterns?.map((intern: any) => (
                      <SelectItem key={intern._id} value={intern._id}>
                        {intern.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Leave Type
                </label>
                <Select
                  value={filters.leaveType}
                  onValueChange={(value) =>
                    updateFilters({ leaveType: value as FilterLeaveType })
                  }
                >
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Leave Types</SelectItem>
                    {Object.entries(LEAVE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-4"></div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Loading Leave Requests
            </h3>
            <p className="text-gray-600">Fetching leave requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Filters */}
      <Card className="border border-gray-200 gap-0">
        <CardHeader className="pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-lg text-gray-900">Filters</CardTitle>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  status: "ALL",
                  timeframe: "ALL",
                  intern: "ALL",
                  leaveType: "ALL",
                  search: "",
                });
              }}
              className="w-full h-10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or reason..."
                  value={filters.search || ""}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full h-10 pl-10 pr-4 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  updateFilters({ status: value as FilterStatus })
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Timeframe
              </label>
              <Select
                value={filters.timeframe}
                onValueChange={(value) =>
                  updateFilters({ timeframe: value as FilterTimeframe })
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Time</SelectItem>
                  <SelectItem value="THIS_WEEK">This Week</SelectItem>
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="LAST_MONTH">Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Intern
              </label>
              <Select
                value={filters.intern}
                onValueChange={(value) => updateFilters({ intern: value })}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select intern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Interns</SelectItem>
                  {uniqueInterns?.map((intern: any) => (
                    <SelectItem key={intern._id} value={intern._id}>
                      {intern.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Leave Type
              </label>
              <Select
                value={filters.leaveType}
                onValueChange={(value) =>
                  updateFilters({ leaveType: value as FilterLeaveType })
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Leave Types</SelectItem>
                  {Object.entries(LEAVE_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold"> {stats.total || 0}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-gray-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold"> {stats.pending || 0}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-gray-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold"> {stats.approved || 0}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-gray-700" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold"> {stats.rejected || 0}</p>
            </div>
            <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-4 w-4 text-gray-700" />
            </div>
          </div>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card className="border border-gray-200 shadow-sm gap-4">
        <CardHeader className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-md">
                <FileText className="h-4 w-4 text-gray-700" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900">
                  Leave Requests
                </CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Page {currentPage} of {totalPages} • Showing{" "}
                  {filteredLeaveRequests?.length || 0} of {totalItems} requests
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {filteredLeaveRequests?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                No leave requests
              </h3>
              <p className="text-sm text-gray-500">
                {filters.search ||
                filters.status !== "ALL" ||
                filters.timeframe !== "ALL" ||
                filters.intern !== "ALL"
                  ? "No requests match your filters"
                  : "No requests submitted yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLeaveRequests?.map((leave: ILeaveRequest) => (
                <div
                  key={leave._id}
                  className="border border-gray-300 rounded-md p-3 hover:shadow-md hover:border-gray-400 transition-all duration-200 bg-white"
                >
                  {/* Main Content Row */}
                  <div className="flex items-center justify-between gap-3 mb-2">
                    {/* Left: Intern Info & Dates */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {leave.intern.username}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs px-2 py-0.5 flex-shrink-0 border ${getStatusBadgeVariant(leave.status) === 'default' ? 'bg-gray-50 text-gray-900 border-gray-300' :
                              getStatusBadgeVariant(leave.status) === 'destructive' ? 'bg-gray-100 text-gray-900 border-gray-400' :
                              'bg-white text-gray-800 border-gray-500'}`}
                          >
                            {leave.status === "APPROVED" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {leave.status === "REJECTED" && <XCircle className="w-3 h-3 mr-1" />}
                            {leave.status === "PENDING" && <Clock className="w-3 h-3 mr-1" />}
                            {leave.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          </span>
                          <span>{leave.days} day{leave.days > 1 ? "s" : ""}</span>
                          <span className="hidden sm:block">
                            {leave.leaveType && LEAVE_TYPE_LABELS[leave.leaveType as LeaveType]
                              ? LEAVE_TYPE_LABELS[leave.leaveType as LeaveType]
                              : 'General Leave'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Quick Actions for Pending */}
                      {leave.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(leave._id, "APPROVED")
                            }
                            disabled={updateLeaveStatus.isPending}
                            className="h-7 px-2 bg-gray-900 hover:bg-gray-800 text-white text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusUpdate(leave._id, "REJECTED")
                            }
                            disabled={updateLeaveStatus.isPending}
                            className="h-7 px-2 text-xs border-gray-400 text-gray-700 hover:bg-gray-50"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {/* More Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedLeave(leave);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5" />
                                  Leave Request Details
                                </DialogTitle>
                              </DialogHeader>
                              {selectedLeave && (
                                <div className="space-y-4 mt-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border border-gray-200">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                          Intern Information
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div>
                                          <p className="text-xs text-gray-500">
                                            Name
                                          </p>
                                          <p className="font-medium">
                                            {selectedLeave.intern.username}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">
                                            Email
                                          </p>
                                          <p className="text-sm">
                                            {selectedLeave.intern.email}
                                          </p>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card className="border border-gray-200">
                                      <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                          Leave Details
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Start
                                            </p>
                                            <p className="text-sm font-medium">
                                              {formatDate(
                                                selectedLeave.startDate
                                              )}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              End
                                            </p>
                                            <p className="text-sm font-medium">
                                              {formatDate(
                                                selectedLeave.endDate
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Duration
                                            </p>
                                            <p className="font-medium">
                                              {selectedLeave.days} days
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">
                                              Status
                                            </p>
                                            <Badge
                                              variant={getStatusBadgeVariant(
                                                selectedLeave.status
                                              )}
                                            >
                                              {selectedLeave.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>

                                  <Card className="border border-gray-200">
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm">
                                        Reason
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {selectedLeave.reason}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteLeave(leave._id)}
                            disabled={deleteLeaveRequest.isPending}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Compact reason section */}
                  <div className="flex items-start gap-2">
                    <FileText className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 flex-1">
                      {leave.reason}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(leave.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">per page</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                      disabled={typeof page !== "number"}
                      className={`w-8 h-8 p-0 ${
                        page === currentPage
                          ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeavePage;
