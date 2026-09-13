import { Plus, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ChipListField({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [draft, setDraft] = useState("")

  const add = () => {
    const next = draft.trim()
    if (!next) return
    onChange([...items, next])
    setDraft("")
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={`${label}-${index}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-sm"
          >
            <span className="min-w-0 flex-1">{item}</span>
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${item}`}
              onClick={() =>
                onChange(items.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={`Add ${label.toLowerCase()}…`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus />
        </Button>
      </div>
    </div>
  )
}
