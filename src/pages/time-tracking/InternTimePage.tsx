import TitleHeader from "@/components/layout/TitleHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CheckInOut from "@/components/time-tracking/CheckInOut";
import TimeHistory from "@/components/time-tracking/TimeHistory";
import SubmitWorkingHours from "@/components/time-tracking/SubmitWorkingHours";
import MyWorkingHoursRequests from "@/components/time-tracking/MyWorkingHoursRequests";
import { useState } from "react";

const InternTimePage = () => {
  const [activeTab, setActiveTab] = useState("checkin");

  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Time Tracking"
        description="Track your work hours and manage your time"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="checkin">Check In/Out & History</TabsTrigger>
          <TabsTrigger value="submit">Submit Working Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6 mt-4">
          <CheckInOut />
          <TimeHistory />
        </TabsContent>

        <TabsContent value="submit" className="space-y-6 mt-4">
          <SubmitWorkingHours />
          <MyWorkingHoursRequests />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default InternTimePage;
