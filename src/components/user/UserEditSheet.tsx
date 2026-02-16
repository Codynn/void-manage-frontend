import type { IUserData,  } from "@/types/user.type";
import {
  LEAVE_TYPE_LABELS,
  type LeaveType,
} from "@/types/leave.type";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useUpdateUser } from "@/services/api/user.api";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Trash2, Plus, Calendar, User, Mail, Shield } from "lucide-react";

interface UserEditSheetProps {
  children: React.ReactNode;
  user: IUserData;
}

const UserEditSheet = ({ children, user }: UserEditSheetProps) => {
  const { mutate: updateUser, isPending } = useUpdateUser();

  //   Only partial IUserData is needed for updates
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<Partial<IUserData>>({
    defaultValues: {
      username: user.username,
      email: user.email,
      role: user.role,
      assignedLeaves: user.assignedLeaves || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assignedLeaves",
  });

  const onSubmit = (data: Partial<IUserData>) => {
    if (isPending) return;

    updateUser({
      ...user,
      ...data,
    });
  };

  const addNewLeave = () => {
    append({
      leaveType: getFirstAvailableLeaveType(),
      totalLeavesAvailable: 0,
      takenLeaves: 0,
    });
  };

  // Get available leave types for a specific index (excluding already selected ones)
  const getAvailableLeaveTypes = (currentIndex: number) => {
    const currentSelection = watch(
      `assignedLeaves.${currentIndex}.leaveType` as const
    );
    const selectedLeaveTypes =
      watch("assignedLeaves")
        ?.map((leave, index) =>
          index !== currentIndex ? leave.leaveType : null
        )
        .filter(Boolean) || [];

    return Object.entries(LEAVE_TYPE_LABELS).filter(
      ([key]) =>
        !selectedLeaveTypes.includes(key as LeaveType) ||
        key === currentSelection
    );
  };

  // Get the first available leave type for new entries
  const getFirstAvailableLeaveType = (): LeaveType => {
    const selectedLeaveTypes =
      watch("assignedLeaves")?.map((leave) => leave.leaveType) || [];
    const availableType = Object.keys(LEAVE_TYPE_LABELS).find(
      (key) => !selectedLeaveTypes.includes(key as LeaveType)
    );
    return (availableType as LeaveType) || "CASUAL_LEAVE";
  };

  // Check if all leave types are already selected
  const areAllLeaveTypesSelected = () => {
    const selectedLeaveTypes =
      watch("assignedLeaves")?.map((leave) => leave.leaveType) || [];
    return selectedLeaveTypes.length >= Object.keys(LEAVE_TYPE_LABELS).length;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-[800px] flex flex-col h-full max-h-screen">
        <SheetHeader className="flex-shrink-0 pb-4 border-b">
          <SheetTitle>Editing User: {user.username}</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-black" />
                Basic Information
              </h3>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <User className="h-3 w-3 text-black" />
                  Username
                </Label>
                <Input
                  {...register("username", {
                    required: "Username is required",
                  })}
                  defaultValue={user.username}
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  placeholder="Enter username"
                />
                {errors.username && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.username.message}
                  </span>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Mail className="h-3 w-3 text-black" />
                  Email
                </Label>
                <Input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  defaultValue={user.email}
                  className="mt-1 border-gray-300 focus:border-black focus:ring-black"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <span className="text-red-500 text-xs mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-black" />
                  Role
                </Label>
                <Select
                  value={watch("role")}
                  defaultValue={user.role}
                  onValueChange={(value) => setValue("role", value)}
                >
                  <SelectTrigger className="mt-1 border-gray-300 focus:border-black focus:ring-black">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERN">Intern</SelectItem>
                    <SelectItem value="MENTOR">Mentor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assigned Leaves Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-black" />
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Assigned Leaves
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewLeave}
                  disabled={areAllLeaveTypesSelected()}
                  className="flex items-center gap-2 bg-gray-50 border-gray-300 text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Add Leave Type
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    No leave types assigned
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click "Add Leave Type" to get started
                  </p>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-300 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-16">
                            SN
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Leave Type
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                            Total Leaves Available
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 w-16">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {fields.map((field, index) => (
                          <tr key={field.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <Select
                                value={watch(
                                  `assignedLeaves.${index}.leaveType` as const
                                )}
                                onValueChange={(value) =>
                                  setValue(
                                    `assignedLeaves.${index}.leaveType` as const,
                                    value as LeaveType
                                  )
                                }
                              >
                                <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black">
                                  <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableLeaveTypes(index).map(
                                    ([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <Input
                                  {...register(
                                    `assignedLeaves.${index}.totalLeavesAvailable` as const,
                                    {
                                      required: "Total leaves is required",
                                      min: {
                                        value: 0,
                                        message: "Cannot be negative",
                                      },
                                      valueAsNumber: true,
                                    }
                                  )}
                                  type="number"
                                  min="0"
                                  placeholder="Enter total leaves"
                                  className="border-gray-300 focus:border-black focus:ring-black"
                                />
                                {errors.assignedLeaves?.[index]
                                  ?.totalLeavesAvailable && (
                                  <span className="text-red-500 text-xs mt-1 block">
                                    {
                                      errors.assignedLeaves[index]
                                        ?.totalLeavesAvailable?.message
                                    }
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>Update User</>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserEditSheet;
