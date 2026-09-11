import type { ILeaveRequest } from "@/types/leave.type";
import { LEAVE_TYPE_LABELS } from "@/types/leave.type";
import { Badge } from "../ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle, Calendar, FileText } from "lucide-react";

const LeaveViewCard = ({ request }: { request: ILeaveRequest }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-gray-50 text-gray-900 border-gray-300";
      case "REJECTED":
        return "bg-gray-100 text-gray-900 border-gray-400";
      case "PENDING":
        return "bg-white text-gray-800 border-gray-500";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return CheckCircle;
      case "REJECTED":
        return XCircle;
      case "PENDING":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const StatusIcon = getStatusIcon(request.status);
  const leaveTypeLabel = request.leaveType && LEAVE_TYPE_LABELS[request.leaveType] 
    ? LEAVE_TYPE_LABELS[request.leaveType] 
    : 'General Leave';

  return (
    <div className="border border-gray-300 rounded-md p-3 hover:shadow-md hover:border-gray-400 transition-all duration-200 bg-white">
      {/* Single row layout with all key info */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </h3>
            <p className="text-xs text-gray-600">
              {request.days} day{request.days > 1 ? "s" : ""} • {leaveTypeLabel}
            </p>
          </div>
        </div>
        
        <Badge variant="outline" className={`text-xs px-2 py-0.5 flex-shrink-0 ${getStatusColor(request.status)}`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {request.status}
        </Badge>
      </div>

      {/* Compact reason section */}
      <div className="flex items-start gap-2">
        <FileText className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2 flex-1">
          {request.reason}
        </p>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {formatDate(request.createdAt)}
        </span>
      </div>

      {request.status === "REJECTED" && request.reviewComment && (
        <div className="mt-2 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-2">
          <XCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">
            <span className="font-medium">Reason for rejection: </span>
            {request.reviewComment}
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaveViewCard;
