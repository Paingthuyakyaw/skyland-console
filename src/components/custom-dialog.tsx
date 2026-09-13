import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type CustomDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  description?: ReactNode
  trigger?: ReactNode
  triggerLabel?: string
  footer?: ReactNode
  doneLabel?: string
  showDone?: boolean
  contentClassName?: string
}

export function CustomDialog({
  open,
  onOpenChange,
  title,
  children,
  description,
  trigger,
  footer,
  doneLabel = "Done",
  showDone = true,
  contentClassName,
}: CustomDialogProps) {
  return (
    <>
      {trigger ?? null}

      {open ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className={cn("sm:max-w-md", contentClassName)}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </DialogHeader>

            {children}

            {(footer || showDone) && (
              <DialogFooter className="sm:justify-end">
                {footer}
                {showDone ? (
                  <DialogClose
                    render={
                      <Button type="button" variant="outline">
                        {doneLabel}
                      </Button>
                    }
                  />
                ) : null}
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
