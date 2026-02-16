// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { CheckSquare } from "lucide-react";
// import { useUserDailyChecklist } from "../user/hooks/useUserDailyChecklist";

// const UserDailyChecklist = ({ userId }: { userId: string }) => {
//   const { tasks, toggleTask, isLoading } = useUserDailyChecklist(userId);

//   if (isLoading) {
//     return (
//       <Card className="border-0 shadow-sm">
//         <CardContent className="py-6 text-center text-sm text-gray-500">
//           Loading checklist…
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="border-0 shadow-sm">
//       <CardHeader className="pb-2">
//         <CardTitle className="flex items-center gap-2 text-base">
//           <CheckSquare className="h-4 w-4 text-gray-600" />
//           Daily Checklist
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-2">
//         {tasks.map(task => (
//           <div key={task._id} className="flex items-center gap-2 text-sm">
//             <Checkbox
//               checked={task.completed}
//               onCheckedChange={() => toggleTask(task._id, task.completed)}
//             />
//             <span className={task.completed ? "text-gray-500 line-through" : ""}>{task.name}</span>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// };

// export default UserDailyChecklist;
