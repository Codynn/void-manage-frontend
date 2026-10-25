import { useState } from "react";
import TitleHeader from "@/components/layout/TitleHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BookSpacePanel from "@/components/space/BookSpacePanel";
import MyAllocationsPanel from "@/components/space/MyAllocationsPanel";

const InternSpacesPage = () => {
  const [activeTab, setActiveTab] = useState("book");
  return (
    <main className="p-6 space-y-6">
      <TitleHeader
        title="Spaces"
        description="Your default space is auto-allocated when you check in. Request a different one here if needed."
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="book">Book a Space</TabsTrigger>
          <TabsTrigger value="mine">My Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="book" className="mt-4">
          <BookSpacePanel />
        </TabsContent>
        <TabsContent value="mine" className="mt-4">
          <MyAllocationsPanel />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default InternSpacesPage;
