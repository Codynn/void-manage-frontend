import { BarChart3, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProjectStatsProps {
  tasks: any[];
}

export const ProjectStats = ({ tasks }: ProjectStatsProps) => {
  const getTaskStats = () => {
    const stats = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: tasks.length,
      completed: stats.completed || 0,
      inProgress: stats['in-progress'] || 0,
      pending: stats.pending || 0,
      onHold: stats['on-hold'] || 0
    };
  };

  const stats = getTaskStats();
  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statItems = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Project Statistics</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          {statItems.map((item) => (
            <div key={item.label} className="text-center flex items-center gap-4 p-2 px-4 bg-gray-50 rounded-lg">
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold ml-auto">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {stats.total === 0 && (
          <p className="text-gray-500 text-center py-4">No tasks created yet</p>
        )}
      </div>
    </Card>
  );
};
