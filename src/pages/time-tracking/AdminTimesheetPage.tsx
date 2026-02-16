import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserCardsView from "@/components/time-tracking/UserCardsView";
import DateTableView from "@/components/time-tracking/DateTableView";
import TimelineGraphView from "@/components/time-tracking/TimelineGraphView";

const AdminTimesheetPage = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Timesheets</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all user schedules
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="users">By Users</TabsTrigger>
          <TabsTrigger value="date">By Date</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserCardsView />
        </TabsContent>

        <TabsContent value="date" className="mt-6">
          <DateTableView />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <TimelineGraphView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTimesheetPage;