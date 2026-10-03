import { RichTextEditor } from "@/components/rich-text-editor"
import { Field, FieldLabel } from "@/components/ui/field"
import { richTextFromItems } from "@/lib/rich-text"

export function RichTextListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const id = `tour-${label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <RichTextEditor
        id={id}
        value={richTextFromItems(values)}
        onChange={(value) => onChange(value ? [value] : [])}
        placeholder={placeholder}
      />
    </Field>
  )
}
