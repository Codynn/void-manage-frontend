import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useForm, Controller } from 'react-hook-form';
import type { TLeaveRequestForm } from '@/types/leave.type';
import { LEAVE_TYPE_LABELS, type LeaveType } from '@/types/leave.type';
import { useCreateLeaveRequest } from '@/services/api/leave.api';
import { LoaderCircle, AlertCircle, Calendar } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetUserData } from '@/services/api/user.api';
import { useState, useEffect } from 'react';

const LeaveForm = () => {
  const { data: userData } = useGetUserData();
  const queryClient = useQueryClient();
  console.log('User Data in LeaveForm:', userData);
  useEffect(() => {
  console.log("User Data:", userData);
}, [userData]);


  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [requestedDays, setRequestedDays] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TLeaveRequestForm>({
    defaultValues: {
      leaveType: undefined,
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  //   API CALLS
  const { mutate: createLeaveRequest, isPending: isCreating } =
    useCreateLeaveRequest();

  // Watch form values to calculate days and validate
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate requested days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end date
      setRequestedDays(diffDays);
    } else {
      setRequestedDays(0);
    }
  }, [startDate, endDate]);

  // Get available leaves for selected leave type
  const getAvailableLeaves = (leaveType: LeaveType) => {
    if (!userData?.assignedLeaves) return 0;
    const leave = userData.assignedLeaves.find((l: any) => l.leaveType === leaveType);
    return leave ? leave.totalLeavesAvailable - leave.takenLeaves : 0;
  };

  // Validate leave request
  const validateLeaveRequest = () => {
    if (!selectedLeaveType) {
      setValidationError('Please select a leave type');
      return false;
    }

    const availableLeaves = getAvailableLeaves(selectedLeaveType);
    if (requestedDays > availableLeaves) {
      setValidationError(
        `Insufficient leave balance. You have ${availableLeaves} days available for ${LEAVE_TYPE_LABELS[selectedLeaveType]}. Please contact administration for additional leave allocation.`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  // Update validation when leave type or days change
  useEffect(() => {
    if (selectedLeaveType && requestedDays > 0) {
      validateLeaveRequest();
    }
  }, [selectedLeaveType, requestedDays]);

  const onSubmit = (data: TLeaveRequestForm) => {
    if (!validateLeaveRequest()) {
      return;
    }

    const submissionData = {
      ...data,
      days: requestedDays,
    };

    createLeaveRequest(submissionData, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['myLeaveRequests'],
        });
      },
    });
  };
  return (
    <Card className=''>
      <CardHeader>
        <CardTitle className=''>Apply for Leave</CardTitle>
        <CardDescription className='text-gray-700'>
          Submit a new leave request with reason and dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          {/* Leave Type Selection */}
          <div className='space-y-2'>
            <Label htmlFor='leaveType' className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Leave Type
            </Label>
            <Controller
              name='leaveType'
              control={control}
              rules={{ required: 'Please select a leave type' }}
              render={({ field }) => (
                <Select
                  value={field.value || ''}
                  onValueChange={(value: LeaveType) => {
                    field.onChange(value);
                    setSelectedLeaveType(value);
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Select leave type' />
                  </SelectTrigger>
                  <SelectContent>
                    {userData?.assignedLeaves?.map((leave: any) => {
                      const availableLeaves = leave.totalLeavesAvailable - leave.takenLeaves;
                      return (
                        <SelectItem key={leave.leaveType} value={leave.leaveType}>
                          <div className='flex items-center justify-between w-full'>
                            <span>{LEAVE_TYPE_LABELS[leave.leaveType as LeaveType]}</span>
                            <span className='text-xs text-gray-500 ml-2'>
                              ({availableLeaves} available)
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.leaveType && (
              <p className='text-red-500 text-sm'>{errors.leaveType.message}</p>
            )}

            {/* Show available leaves info */}
            {selectedLeaveType && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4 text-blue-600' />
                  <span className='text-sm font-medium text-blue-900'>
                    {LEAVE_TYPE_LABELS[selectedLeaveType]}
                  </span>
                </div>
                <p className='text-sm text-blue-700 mt-1'>
                  Available: {getAvailableLeaves(selectedLeaveType)} days
                  {requestedDays > 0 && (
                    <span className='ml-2'>| Requesting: {requestedDays} days</span>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='startDate' className=''>
                Start Date
              </Label>
              <Input
                id='startDate'
                type='date'
                {...register('startDate', { required: true })}
                className='  '
                required
              />
              {errors.startDate && (
                <p className='text-red-500'>Start date is required</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='endDate' className=''>
                End Date
              </Label>
              <Input
                id='endDate'
                type='date'
                {...register('endDate', { required: true })}
                className='  '
                required
              />
              {errors.endDate && (
                <p className='text-red-500'>End date is required</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='reason' className=''>
              Reason for Leave
            </Label>
            <Textarea
              id='reason'
              {...register('reason', { required: true })}
              placeholder='Please provide a detailed reason for your leave request...'
              className='   placeholder:text-gray-500'
              rows={3}
              required
            />
            {errors.reason && (
              <p className='text-red-500'>Reason is required</p>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <span className='text-sm font-medium text-red-900'>
                  Leave Request Error
                </span>
              </div>
              <p className='text-sm text-red-700 mt-1'>
                {validationError}
              </p>
            </div>
          )}

          <Button
            disabled={isCreating || !!validationError}
            type='submit'
            className='w-full'
          >
            Submit Leave Request
            {isCreating && (
              <LoaderCircle className='w-4 h-4 ml-2 animate-spin' />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveForm;
