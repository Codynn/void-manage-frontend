import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookSpacePanel from "@/components/space/BookSpacePanel";
import MyAllocationsPanel from "@/components/space/MyAllocationsPanel";
import ManageAllocationsPanel from "@/components/space/ManageAllocationsPanel";

const MentorSpacesPage = () => {
  const [activeTab, setActiveTab] = useState("book");
  return (
    <main className="p-6 space-y-6">
      <TitleHeader title="Spaces" description="Book spaces and manage intern booking requests" />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="book">Book a Space</TabsTrigger>
          <TabsTrigger value="mine">My Bookings</TabsTrigger>
          <TabsTrigger value="manage">Manage Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="book" className="mt-4">
          <BookSpacePanel />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <MyAllocationsPanel />
        </TabsContent>
        <TabsContent value="manage" className="mt-4">
          <ManageAllocationsPanel isAdmin={false} />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default MentorSpacesPage;
