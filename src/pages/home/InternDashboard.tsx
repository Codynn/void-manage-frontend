import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import DataView from "../../components/home/DataView";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Clock, Calendar, Camera, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InternLinkSection from "@/components/home/InternLinkSection";
import { useUserDashboard } from "@/services/api/dashboard.api";
import WelcomeModal from "../../components/home/WelcomeModal";

const InternDashboard = () => {
  const { data } = useUserDashboard();
  const [showModal, setShowModal] = useState(false);

useEffect(() => {
  console.log("Dashboard data:", data);
  if (data?.firstLogin) {
    setShowModal(true);
  }
}, [data]);


  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      <Header />
      <DataView />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">
              Administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Link to="/intern/time-tracking" className="w-full">
              <Button
                variant="outline"
                className="border-border text-foreground w-full hover:bg-muted bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Check-In-Out
              </Button>
            </Link>
            <Link to="/intern/contract" className="w-full">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent w-full"
              >
                <Clock className="w-4 h-4 mr-2" />
                Contract
              </Button>
            </Link>
            <Link to="/intern/leave" className="w-full">
              <Button
                variant="outline"
                className="border-border text-foreground w-full hover:bg-muted bg-transparent"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Leave Requests
              </Button>
            </Link>
            <Link to="/intern/welcome-photos" className="w-full">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Welcome Photos
              </Button>
            </Link>
            <Link to="/intern/milestones" className="w-full">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Milestones
              </Button>
            </Link>
            <Link to="/intern/certificates" className="w-full">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted bg-transparent w-full"
              >
                <Award className="w-4 h-4 mr-2" />
                Certificates
              </Button>
            </Link>
          </CardContent>
        </Card>

        <InternLinkSection />
      </div>

      {showModal && <WelcomeModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default InternDashboard;
