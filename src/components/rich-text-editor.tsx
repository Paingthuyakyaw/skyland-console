import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

const TOOLS = [
  { label: "B", command: "bold", className: "font-bold" },
  { label: "I", command: "italic", className: "italic font-medium" },
  { label: "U", command: "underline", className: "underline font-medium" },
  { label: "H2", command: "h2", className: "" },
  { label: "List", command: "list", className: "" },
] as const

export function isEmptyHtml(html: string) {
  return (
    html
      .replace(/<br\s*\/?>/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/<[^>]+>/g, "")
      .trim().length === 0
  )
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write your post content here…",
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef(value)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    if (document.activeElement === editor) return
    if (editor.innerHTML !== value) {
      editor.innerHTML = value
      lastEmitted.current = value
    }
  }, [value])

  const emit = () => {
    const html = editorRef.current?.innerHTML ?? ""
    const next = isEmptyHtml(html) ? "" : html
    if (next === lastEmitted.current) return
    lastEmitted.current = next
    onChange(next)
  }

  const apply = (command: (typeof TOOLS)[number]["command"]) => {
    editorRef.current?.focus()
    if (command === "h2") {
      document.execCommand("formatBlock", false, "h2")
    } else if (command === "list") {
      document.execCommand("insertUnorderedList")
    } else {
      document.execCommand(command)
    }
    emit()
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-control border border-input bg-card transition-[color,box-shadow,background-color] focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25",
        className
      )}
    >
      <div className="flex gap-1 border-b border-border px-2 py-1.5 text-sm font-bold text-muted-foreground">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            className={cn("rounded px-2 py-0.5 hover:bg-muted", tool.className)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => apply(tool.command)}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="relative">
        {isEmptyHtml(value) ? (
          <p className="pointer-events-none absolute inset-0 px-3 py-2 text-sm text-muted-foreground/70">
            {placeholder}
          </p>
        ) : null}
        <div
          id={id}
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          className="min-h-48 px-3 py-2 text-sm text-foreground outline-none [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          onInput={emit}
          onBlur={emit}
        />
      </div>
    </div>
  )
}
