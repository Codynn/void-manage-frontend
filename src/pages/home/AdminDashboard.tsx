import Header from "@/components/layout/Header";
import DataView from "../../components/home/DataView";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, Calendar, User, Flag, ClipboardList, Folder, FileSignature, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import CreateLinkDialog from "@/components/home/CreateLinkDialog";
import LinkSection from "@/components/home/LinkSection";
import { Badge } from "@/components/ui/badge";
import { useGetLeaveRequests } from "@/services/api/leave.api";
import { useGetPhaseTemplates } from "@/services/api/milestone.api";

const AdminDashboard = () => {
  const { data: leaveData } = useGetLeaveRequests({ status: "PENDING" });
  const { data: phaseTemplates, isLoading: isLoadingTemplates } = useGetPhaseTemplates();

  const templates = phaseTemplates || [];
  const hasOnboardingTemplate = templates.some((t: any) => t.isOnboarding);

  return (
    <div className="space-y-6 p-6">
      <Header />
      <DataView />

      {!isLoadingTemplates && !hasOnboardingTemplate && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">
                  No onboarding template set up yet
                </p>
                <p className="text-sm text-amber-700">
                  {templates.length === 0
                    ? "You haven't created any phase templates. Create one and mark it as the onboarding template so new users get a guided setup checklist."
                    : "None of your phase templates are marked as the onboarding template. New users won't get a guided setup checklist until one is."}
                </p>
              </div>
            </div>
            <Link to="/admin/milestones" className="shrink-0">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                {templates.length === 0 ? "Create Template" : "Manage Templates"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

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
            <Link to="/admin/templates" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <FileSignature className="mr-2 h-4 w-4" />
                Templates
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

            <Link to="/admin/documents" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Folder className="mr-2 h-4 w-4" />
                Documents
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