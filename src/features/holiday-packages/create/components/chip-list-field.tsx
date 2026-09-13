import { Plus, X } from "lucide-react"
import { useRef, useState } from "react"

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
  const inputRef = useRef<HTMLInputElement>(null)
  const list = items ?? []

  const add = () => {
    const next = draft.trim()
    if (!next) {
      inputRef.current?.focus()
      return
    }

    onChange([...list, next])
    setDraft("")
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="space-y-1">
        {list.map((item, index) => (
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
                onChange(list.filter((_, itemIndex) => itemIndex !== index))
              }
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
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
        <button
          type="button"
          aria-label={`Add ${label}`}
          onClick={add}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-input bg-background text-foreground transition-colors hover:bg-muted"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
