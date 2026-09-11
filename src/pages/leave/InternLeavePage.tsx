import TitleHeader from "@/components/layout/TitleHeader";
import LeaveForm from "@/components/leave/LeaveForm";
import LeaveHistory from "@/components/leave/LeaveHistory";
import LeavePolicies from "@/components/leave/LeavePolicies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetMyLeaveRequests, useGetMyLeaveRequestsPaginated } from "@/services/api/leave.api";
import type { ILeaveRequest } from "@/types/leave.type";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { useState } from "react";

const InternLeavePage = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  // Use the original hook for summary stats (gets all data)
  const { data: allLeaveData } = useGetMyLeaveRequests();
  const allLeaveRequests = allLeaveData?.items || allLeaveData || [];

  // Use the paginated hook for the history section
  const { data: paginatedLeaveData, isLoading } = useGetMyLeaveRequestsPaginated(pagination);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination({ page: 1, pageSize: newPageSize });
  };

  const totalLeaveDays = allLeaveRequests
    ?.filter((req: ILeaveRequest) => req.status === "APPROVED")
    ?.reduce((sum: number, req: ILeaveRequest) => sum + req.days, 0);

  return (
    <main className="p-4 md:p-6 space-y-6">
      <TitleHeader
        title="Leave Requests"
        description="View and manage your leave requests"
      />

      {/* Leave Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allLeaveRequests?.length}</div>
            <p className="text-xs text-gray-700 mt-2">Leave applications</p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Taken</CardTitle>
            <Clock className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeaveDays}</div>
            <p className="text-xs text-gray-700 mt-2">Approved leave days</p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                allLeaveRequests?.filter(
                  (req: ILeaveRequest) => req.status === "PENDING"
                ).length
              }
            </div>
            <p className="text-xs text-gray-700 mt-2">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Request Form */}
        <div className="lg:col-span-1">
          <LeaveForm />
        </div>

        {/* Leave History */}
        <div className="lg:col-span-2">
          <LeaveHistory 
            leaveRequests={paginatedLeaveData || { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 }}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Leave Policy */}
      <LeavePolicies />
    </main>
  );
};

export default InternLeavePage;
