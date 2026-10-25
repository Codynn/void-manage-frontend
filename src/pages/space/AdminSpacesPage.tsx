import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RoomsManagePanel from "@/components/space/RoomsManagePanel";
import SpacesManagePanel from "@/components/space/SpacesManagePanel";
import ManageAllocationsPanel from "@/components/space/ManageAllocationsPanel";
import SpaceRoutinesManagePanel from "@/components/space/SpaceRoutinesManagePanel";
import SpaceAuditLogPanel from "@/components/space/SpaceAuditLogPanel";
import BookSpacePanel from "@/components/space/BookSpacePanel";
import MyAllocationsPanel from "@/components/space/MyAllocationsPanel";

const AdminSpacesPage = () => {
  const [activeTab, setActiveTab] = useState("bookings");
  return (
    <main className="p-6 space-y-6">
      <TitleHeader title="Space Allocation" description="Rooms, spaces, bookings, timetable, and activity log" />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="spaces">Spaces</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="routines">Timetable</TabsTrigger>
          <TabsTrigger value="book">Book a Space</TabsTrigger>
          <TabsTrigger value="mine">My Bookings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="rooms" className="mt-4">
          <RoomsManagePanel />
        </TabsContent>
        <TabsContent value="spaces" className="mt-4">
          <SpacesManagePanel />
        </TabsContent>
        <TabsContent value="bookings" className="mt-4">
          <ManageAllocationsPanel isAdmin />
        </TabsContent>
        <TabsContent value="routines" className="mt-4">
          <SpaceRoutinesManagePanel />
        </TabsContent>
        <TabsContent value="book" className="mt-4">
          <BookSpacePanel />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <MyAllocationsPanel />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <SpaceAuditLogPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AdminSpacesPage;
