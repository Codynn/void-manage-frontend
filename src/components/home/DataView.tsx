import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetDashboardData } from "@/services/api/dashboard.api";
import { useGetUserData } from "@/services/api/user.api";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetTotalHours } from "@/services/api/time.api";

const DataCard = (data: {
  title: string;
  value: string | number;
  description: string;
}) => {
  return (
    <Card className="gap-2 flex-1">
      <CardHeader className="flex flex-row items-center  space-y-0 gap-4 ">
        <CardTitle className="text-sm font-medium ">{data.title}</CardTitle>
        <Users className="h-4 w-4 " />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold ">{data.value}</div>
        <p className="text-xs ">{data.description}</p>
      </CardContent>
    </Card>
  );
};

const DataView = () => {
  const { data: userData } = useGetUserData();
  const { data: dashboardData } = useGetDashboardData();
  const { data: totalData } = useGetTotalHours();

  // if (isLoading ) {
  //   return (
  //     <div className="flex items-center gap-6">
  //       <Skeleton className="h-[120px] flex-1" />
  //       <Skeleton className="h-[120px] flex-1" />
  //       <Skeleton className="h-[120px] flex-1" />
  //     </div>
  //   );
  // }

  const getDataList = () => {
    if (!dashboardData && !userData) return [];

    switch (userData?.role) {
      case "ADMIN":
        return [
          {
            title: "Total Interns",
            value: dashboardData?.totalInterns || 0,
            description: "numbers of interns",
          },
          {
            title: "Total Mentors",
            value: dashboardData?.totalMentors || 0,
            description: "numbers of mentors",
          },
          {
            title: "Completed Projects",
            value: dashboardData?.completedProjects || 0,
            description: "numbers of projects completed",
          },
          {
            title: "Average Progress",
            value: dashboardData?.averageProgress || 0,
            description: "Average progress of all interns",
          },
        ];
      case "MENTOR":
        return [
          {
            title: "Assigned Interns",
            value: dashboardData?.totalInterns   || 0,
            description: "numbers of interns assigned",
          },
          {
            title: "Average Progress",
            value: dashboardData?.averageProgress || 0,
            description: "Average progress of interns",
          },
          {
            title: "Active Sessions",
            value: dashboardData?.activeSessions || 0,
            description: "Active mentoring sessions",
          },
          {
            title: "Pending Reviews",
            value: dashboardData?.pendingReviews || 0,
            description: "numbers of pending reviews",
          },
        ];
      case "INTERN":
        return [
          {
            title: "Active Project",
            value: dashboardData?.activeProject || 0,
            description: "Current project assigned",
          },
          {
            title: "Current Phase",
            value:
              userData?.currentPhase?.find((p: any) => !p.isCompleted)?.name ||
              userData?.currentPhase?.[0]?.name ||
              "None",
            description: "Current phase of the internship",
          },
        ];

      default:
        return [];
    }
  };

  const dataList = getDataList();

  return (
    <div
      className={cn(
        "grid gap-6",
        dataList.length === 4
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
          : "grid-cols-1 md:grid-cols-3"
      )}
    >
      {userData?.role === "INTERN" && totalData && (
        <Card className="gap-2 flex-1">
          <CardHeader className="flex flex-row items-center space-y-0 gap-4">
            <CardTitle className="text-sm font-medium">
              Total Hours Worked
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalData.totalWorkedHours || 0} / 540
            </div>
            <div className="flex mb-2 items-center justify-between">
              <div className="w-full bg-[#f4f4f5] rounded-full h-4">
                <div
                  className="bg-black h-4 rounded-full"
                  style={{
                    width: `${(
                      (totalData.totalWorkedHours / 540) *
                      100
                    ).toFixed(2)}%`,
                  }}
                ></div>
              </div>
            </div>
            <p className="text-xs">
              {((totalData.totalWorkedHours / 540) * 100).toFixed(2)}% completed
            </p>
          </CardContent>
        </Card>
      )}
      {dataList?.map(
        (item: {
          title: string;
          value: string | number;
          description: string;
        }) => (
          <DataCard
            key={item.title}
            title={item.title}
            value={item.value}
            description={item.description}
          />
        )
      )}
    </div>
  );
};

export default DataView;
