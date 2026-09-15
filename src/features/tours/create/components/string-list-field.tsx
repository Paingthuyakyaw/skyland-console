import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function StringListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel,
  tone = "neutral",
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  addLabel: string
  tone?: "neutral" | "include" | "exclude"
}) {
  return (
    <Field>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
            {tone === "include" ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">
                ✓
              </div>
            ) : null}
            {tone === "exclude" ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-black text-red-700">
                ✕
              </div>
            ) : null}
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(event) =>
                onChange(
                  values.map((item, itemIndex) =>
                    itemIndex === index ? event.target.value : item
                  )
                )
              }
            />
            <button
              type="button"
              onClick={() =>
                onChange(values.filter((_, itemIndex) => itemIndex !== index))
              }
              className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("h-8 px-2 text-primary hover:text-primary")}
          onClick={() => onChange([...values, ""])}
        >
          <Plus />
          {addLabel}
        </Button>
      </div>
    </Field>
  )
}
