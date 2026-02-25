import Header from "@/components/layout/Header";
import DataView from "../../components/home/DataView";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Clock, Calendar, User, Flag, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import CreateLinkDialog from "@/components/home/CreateLinkDialog";
import LinkSection from "@/components/home/LinkSection";
import { Badge } from "@/components/ui/badge";
import { useGetLeaveRequests } from "@/services/api/leave.api";

const AdminDashboard = () => {
  const { data: leaveData } = useGetLeaveRequests({ status: "PENDING" });

  return (
    <div className="mx-auto  min-h-screen max-w-7xl space-y-6 p-6">
      <Header />
      <DataView />
      {/* Quick Actions & Links */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/admin/project" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <FileText className="mr-2 h-4 w-4" />
                Projects
              </Button>
            </Link>
            <Link to="/admin/contract" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Clock className="mr-2 h-4 w-4" />
                Contract
              </Button>
            </Link>

            <Link to="/admin/leave" className="w-full ">
              <Button
                variant="outline"
                className="relative w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Leave Requests
                {leaveData?.items?.length > 0 && (
                  <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 p-0 text-xs text-white">
                    {leaveData.items.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/admin/timesheets" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Timesheets
              </Button>
            </Link>

            <Link to="/admin/users" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <User className="mr-2 h-4 w-4" />
                Users
              </Button>
            </Link>
            <Link to="/admin/milestones" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Flag className="mr-2 h-4 w-4" />
                Milestones
              </Button>
            </Link>

            <CreateLinkDialog />
          </CardContent>
        </Card>

        <LinkSection />
      </div>
    </div>
  );
};

export default AdminDashboard;