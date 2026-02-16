import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date | undefined
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Helper function to convert date to YYYY-MM-DD format without timezone issues
const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to parse date string to Date object
const parseDateString = (dateString: string): Date | undefined => {
  if (!dateString || dateString.trim() === '') {
    return undefined;
  }
  
  try {
    // First try to parse as ISO date string or standard date formats
    let date = new Date(dateString);
    
    // If that works and gives a valid date, return it
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If that fails, try to parse YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Validate the components
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return undefined;
    }
    
    date = new Date(year, month - 1, day);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return undefined;
    }
    
    return date;
  } catch {
    return undefined;
  }
};

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
}: DatePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  )
}

export { formatDateToString, parseDateString }
