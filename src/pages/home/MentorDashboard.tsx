import Header from "@/components/layout/Header";
import DataView from "../../components/home/DataView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, Calendar, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import YourInternSection from "@/components/home/YourInternSection";
import LinkSection from "@/components/home/LinkSection";
import CreateLinkDialog from "@/components/home/CreateLinkDialog";

const MentorDashboard = () => {
  return (
    <div className="mx-auto min-h-screen max-w-7xl space-y-6 p-6">
      <Header />
      <DataView />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/mentor/time-tracking" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <FileText className="mr-2 h-4 w-4" />
                Check-In-Out
              </Button>
            </Link>
            <Link to="/mentor/contract" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Clock className="mr-2 h-4 w-4" />
                Contract
              </Button>
            </Link>
            <Link to="/mentor/leave" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Leave Requests
              </Button>
            </Link>
            <Link to="/mentor/welcome-photos" className="w-full ">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <Camera className="mr-2 h-4 w-4" />
                Welcome Photos
              </Button>
            </Link>
            <Link to="/mentor/individual-assignment" className="w-full">
              <Button
                variant="outline"
                className="w-full border-border bg-transparent text-foreground hover:bg-muted"
              >
                <FileText className="mr-2 h-4 w-4" />
                Assign Individual Task
              </Button>
            </Link>

            <CreateLinkDialog />
          </CardContent>
        </Card>

        <LinkSection />
      </div>

      <YourInternSection />
    </div>
  );
};

export default MentorDashboard;
