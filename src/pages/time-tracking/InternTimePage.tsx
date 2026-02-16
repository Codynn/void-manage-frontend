import TitleHeader from "@/components/layout/TitleHeader";
import CheckInOut from "@/components/time-tracking/CheckInOut";
import TimeHistory from "@/components/time-tracking/TimeHistory";
import SubmitWorkingHours from "@/components/time-tracking/SubmitWorkingHours";

const InternTimePage = () => {
  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto space-y-6">
      <TitleHeader
        title="Time Tracking"
        description="Track your work hours and manage your time"
      />
      <CheckInOut />
      <SubmitWorkingHours />
      <TimeHistory />
    </main>
  );
};

export default InternTimePage;
