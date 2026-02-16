import type { ILeaveRequest } from "@/types/leave.type";
import { Calendar } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Pagination } from "../ui/pagination";
import LeaveViewCard from "./LeaveViewCard";
import { LeaveHistorySkeleton } from "./LeaveHistorySkeleton";

interface LeaveHistoryData {
  items: ILeaveRequest[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface LeaveHistoryProps {
  leaveRequests: LeaveHistoryData;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

const LeaveHistory = ({
  leaveRequests,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}: LeaveHistoryProps) => {
  const { items, totalItems, totalPages, currentPage, pageSize } = leaveRequests;

  if (isLoading) {
    return <LeaveHistorySkeleton />;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="w-6 h-6 text-gray-700" />
              Leave History
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Track all your leave requests and their status
              {totalItems > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-800">
                  ({totalItems} total request{totalItems !== 1 ? 's' : ''})
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {items?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-600">You haven't submitted any leave requests yet.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <div className="space-y-2">
                {items.map((request: ILeaveRequest) => (
                  <LeaveViewCard key={request._id} request={request} />
                ))}
              </div>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveHistory;
