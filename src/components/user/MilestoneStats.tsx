interface MilestoneStatsProps {
  completedPhases: number;
  totalPhases: number;
  completedCheckpoints: number;
  totalCheckpoints: number;
}

const MilestoneStats = ({
  completedPhases,
  totalPhases,
  completedCheckpoints,
  totalCheckpoints,
}: MilestoneStatsProps) => {
  const overallProgress = totalCheckpoints > 0 
    ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
    : 0;

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {completedPhases}/{totalPhases}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Phases
        </div>
      </div>
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {completedCheckpoints}/{totalCheckpoints}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Checkpoints
        </div>
      </div>
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {overallProgress}%
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Progress
        </div>
      </div>
    </div>
  );
};

export default MilestoneStats;
