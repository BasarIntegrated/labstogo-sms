"use client";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface DateRangePickerShadcnProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePickerShadcn({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = "Pick a date range",
  className,
}: DateRangePickerShadcnProps) {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    } else if (startDate) {
      return {
        from: new Date(startDate),
        to: undefined,
      };
    } else if (endDate) {
      return {
        from: undefined,
        to: new Date(endDate),
      };
    }
    return undefined;
  });

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);

    if (selectedDate?.from) {
      onStartDateChange(format(selectedDate.from, "yyyy-MM-dd"));
    } else {
      onStartDateChange("");
    }

    if (selectedDate?.to) {
      onEndDateChange(format(selectedDate.to, "yyyy-MM-dd"));
    } else {
      onEndDateChange("");
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
