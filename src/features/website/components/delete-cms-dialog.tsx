import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/custom-dialog"

type DeleteCmsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  deleting: boolean
  onConfirm: () => void
}

export function DeleteCmsDialog({
  open,
  onOpenChange,
  title,
  description,
  deleting,
  onConfirm,
}: DeleteCmsDialogProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={title}
      description={description}
      showDone={false}
      contentClassName="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </>
      }
    >
      {null}
    </CustomDialog>
  )
}
