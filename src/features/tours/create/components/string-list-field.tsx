import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function StringListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  addLabel: string
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${label}-${index}`} className="flex items-center gap-2">
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
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="border-input"
              onClick={() =>
                onChange(values.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              <X />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-input"
          onClick={() => onChange([...values, ""])}
        >
          <Plus />
          {addLabel}
        </Button>
      </div>
    </Field>
  )
}
