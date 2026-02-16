import { MilestoneTracker } from "@/components/milestone/MilestoneTracker";
import { useGetPhasesByInternId } from "@/services/api/milestone.api";
import { useGetUserData } from "@/services/api/user.api";

const InternMileStone = () => {
  const { data: userData } = useGetUserData();
  const { data: phasesResponse, isLoading: phasesLoading } = useGetPhasesByInternId(userData?._id);

  // Extract phases data from the API response
  const phases = phasesResponse?.data?.items || [];

  return (
    <main className="min-h-screen">
      <MilestoneTracker phases={phases} isLoading={phasesLoading} />
    </main>
  );
};

export default InternMileStone;
