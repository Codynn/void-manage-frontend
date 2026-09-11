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
import { LEAVE_TYPE_LABELS, LEAVE_DURATION_LABELS, type LeaveType, type LeaveDurationType } from '@/types/leave.type';
import { useCreateLeaveRequest } from '@/services/api/leave.api';
import { LoaderCircle, AlertCircle, Calendar, Info } from 'lucide-react';
import { useGetUserData } from '@/services/api/user.api';
import { useState, useEffect } from 'react';

const LeaveForm = () => {
  const { data: userData } = useGetUserData();

  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
  const [durationType, setDurationType] = useState<LeaveDurationType>('SINGLE_DAY');
  const [requestedDays, setRequestedDays] = useState<number>(0);
  const [validationError, setValidationError] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors },
  } = useForm<TLeaveRequestForm>({
    defaultValues: {
      leaveType: undefined,
      durationType: 'SINGLE_DAY',
      startDate: '',
      endDate: '',
      shiftStartTime: '',
      shiftEndTime: '',
      reason: '',
    },
  });

  //   API CALLS
  const { mutate: createLeaveRequest, isPending: isCreating } =
    useCreateLeaveRequest();

  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const shiftStartTime = watch('shiftStartTime');
  const shiftEndTime = watch('shiftEndTime');

  // Calculate requested days whenever the relevant fields change
  useEffect(() => {
    if (durationType === 'SHIFT') {
      if (shiftStartTime && shiftEndTime) {
        const [sh, sm] = shiftStartTime.split(':').map(Number);
        const [eh, em] = shiftEndTime.split(':').map(Number);
        const hours = eh + em / 60 - (sh + sm / 60);
        setRequestedDays(hours > 0 ? Math.round((hours / 8) * 100) / 100 : 0);
      } else {
        setRequestedDays(0);
      }
    } else if (durationType === 'SINGLE_DAY') {
      setRequestedDays(startDate ? 1 : 0);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setRequestedDays(diffDays);
    } else {
      setRequestedDays(0);
    }
  }, [durationType, startDate, endDate, shiftStartTime, shiftEndTime]);

  const hasAssignedLeaves = !!userData?.assignedLeaves?.length;

  const getAvailableLeaves = (leaveType: LeaveType) => {
    if (!userData?.assignedLeaves) return 0;
    const leave = userData.assignedLeaves.find((l: any) => l.leaveType === leaveType);
    return leave ? leave.totalLeavesAvailable - leave.takenLeaves : 0;
  };

  const validateLeaveRequest = () => {
    if (!selectedLeaveType) {
      setValidationError('Please select a leave type');
      return false;
    }

    const availableLeaves = getAvailableLeaves(selectedLeaveType);
    if (availableLeaves <= 0) {
      setValidationError(
        `You have no remaining balance for ${LEAVE_TYPE_LABELS[selectedLeaveType]}. Your quota has been fully used.`
      );
      return false;
    }
    if (requestedDays > availableLeaves) {
      setValidationError(
        `Insufficient leave balance. You have ${availableLeaves} day(s) available for ${LEAVE_TYPE_LABELS[selectedLeaveType]}. Please contact administration for additional leave allocation.`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  useEffect(() => {
    if (selectedLeaveType && requestedDays > 0) {
      validateLeaveRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeaveType, requestedDays]);

  const onSubmit = (data: TLeaveRequestForm) => {
    if (!validateLeaveRequest()) {
      return;
    }

    const submissionData: TLeaveRequestForm = {
      ...data,
      durationType,
      startDate: data.startDate,
      endDate: durationType === 'MULTI_DAY' ? data.endDate : data.startDate,
    };

    createLeaveRequest(submissionData, {
      onSuccess: () => {
        reset();
        setSelectedLeaveType(null);
        setDurationType('SINGLE_DAY');
      },
    });
  };

  if (!hasAssignedLeaves) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Apply for Leave</CardTitle>
          <CardDescription className="text-gray-700">
            Submit a new leave request with reason and dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <Info className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">No leave types assigned</p>
              <p className="text-sm text-amber-700 mt-1">
                You don't have any leave types assigned to your account yet, so you can't apply
                for leave. Please contact your admin to get leave quota assigned.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                        <SelectItem
                          key={leave.leaveType}
                          value={leave.leaveType}
                          disabled={availableLeaves <= 0}
                        >
                          <div className='flex items-center justify-between w-full'>
                            <span>{LEAVE_TYPE_LABELS[leave.leaveType as LeaveType]}</span>
                            <span className='text-xs text-gray-500 ml-2'>
                              {availableLeaves <= 0
                                ? '(quota reached)'
                                : `(${availableLeaves} available)`}
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

          {/* Duration Type */}
          <div className='space-y-2'>
            <Label>Duration</Label>
            <Controller
              name='durationType'
              control={control}
              render={() => (
                <Select
                  value={durationType}
                  onValueChange={(value: LeaveDurationType) => setDurationType(value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(LEAVE_DURATION_LABELS) as LeaveDurationType[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {LEAVE_DURATION_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {durationType === 'MULTI_DAY' ? (
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Start Date</Label>
                <Input id='startDate' type='date' {...register('startDate', { required: true })} required />
                {errors.startDate && <p className='text-red-500'>Start date is required</p>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='endDate'>End Date</Label>
                <Input id='endDate' type='date' {...register('endDate', { required: true })} required />
                {errors.endDate && <p className='text-red-500'>End date is required</p>}
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              <Label htmlFor='startDate'>Date</Label>
              <Input id='startDate' type='date' {...register('startDate', { required: true })} required />
              {errors.startDate && <p className='text-red-500'>Date is required</p>}
            </div>
          )}

          {durationType === 'SHIFT' && (
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='shiftStartTime'>Shift Start Time</Label>
                <Input
                  id='shiftStartTime'
                  type='time'
                  {...register('shiftStartTime', { required: durationType === 'SHIFT' })}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='shiftEndTime'>Shift End Time</Label>
                <Input
                  id='shiftEndTime'
                  type='time'
                  {...register('shiftEndTime', { required: durationType === 'SHIFT' })}
                  required
                />
              </div>
            </div>
          )}

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
