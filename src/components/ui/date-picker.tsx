"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const YEAR_WINDOW = 10

type DatePickerProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  "aria-label"?: string
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toDateTimeValue(date: Date) {
  return `${toDateValue(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function parseValue(value?: string) {
  if (!value) return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value)
  if (!match) return undefined
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0)
  )
  return Number.isNaN(date.getTime()) ? undefined : date
}

function timeFromValue(value?: string) {
  const match = /T(\d{2}:\d{2})/.exec(value ?? "")
  return match?.[1] ?? "09:00"
}

function applyTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const next = new Date(date)
  next.setHours(hours || 0, minutes || 0, 0, 0)
  return next
}

function DatePickerBase({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  id,
  withTime = false,
  "aria-label": ariaLabel,
}: DatePickerProps & { withTime?: boolean }) {
  const date = parseValue(value)
  const now = new Date()
  const startMonth = new Date(now.getFullYear() - YEAR_WINDOW, 0)
  const endMonth = new Date(now.getFullYear() + YEAR_WINDOW, 11)

  return (
    <Popover
      onOpenChange={(open, details) => {
        if (open) return
        const target =
          details.event && "target" in details.event
            ? details.event.target
            : null
        if (
          target instanceof Element &&
          target.closest(
            "[data-slot='select-content'], [data-slot='select-trigger']"
          )
        ) {
          details.cancel()
        }
      }}
    >
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            data-empty={!date}
            aria-label={ariaLabel}
            title={
              date
                ? format(date, withTime ? "PPp" : "PP")
                : placeholder
            }
            className={cn(
              "h-10 w-full min-w-0 justify-start overflow-hidden font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon />
        <span className="min-w-0 flex-1 truncate">
          {date ? format(date, withTime ? "PPp" : "PP") : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        collisionAvoidance={{ side: "shift", align: "shift" }}
        className="z-[100] w-auto gap-0 overflow-visible p-0"
      >
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          onSelect={(next) => {
            if (!next) {
              onChange("")
              return
            }
            onChange(
              withTime
                ? toDateTimeValue(applyTime(next, timeFromValue(value)))
                : toDateValue(next)
            )
          }}
        />
        {withTime ? (
          <div className="flex items-center gap-2 border-t border-border px-3 py-3">
            <Clock className="size-4 text-muted-foreground" />
            <Input
              type="time"
              value={date ? format(date, "HH:mm") : timeFromValue(value)}
              disabled={disabled}
              onChange={(event) => {
                const time = event.target.value
                if (!time) return
                onChange(toDateTimeValue(applyTime(date ?? new Date(), time)))
              }}
            />
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function DatePicker(props: DatePickerProps) {
  return <DatePickerBase {...props} />
}

function DateTimePicker(props: DatePickerProps) {
  return (
    <DatePickerBase
      placeholder="Pick date and time"
      {...props}
      withTime
    />
  )
}

export { DatePicker, DateTimePicker }
