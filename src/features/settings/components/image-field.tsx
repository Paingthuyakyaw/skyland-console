import { useRef, type DragEvent } from "react"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"

import { useUploadCmsImage } from "@/store/server/cms/cms"
import { cn } from "@/lib/utils"

export function SettingsImageField({
  label,
  value,
  folderPath,
  emptyLabel,
  className,
  onChange,
}: {
  label: string
  value?: string
  folderPath: string
  emptyLabel: string
  className?: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadCmsImage()

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const response = await upload.mutateAsync({ file, folderPath })
    const url = response.data?.url
    if (!url) {
      toast.error("Upload succeeded but no image URL was returned")
      return
    }
    onChange(url)
  }

  const onDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    void handleFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleFiles(event.target.files)
          event.target.value = ""
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        className={cn(
          "flex h-28 w-40 shrink-0 items-center justify-center overflow-hidden rounded-control border-2 border-dashed border-input text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary",
          className
        )}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="inline-flex flex-col items-center gap-1 px-2 text-center text-xs">
            <ImagePlus className="size-5" />
            {upload.isPending ? "Uploading…" : emptyLabel}
          </span>
        )}
      </button>
    </div>
  )
}
