import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/custom-dialog"

type DeleteComboTourDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourTitle?: string
  deleting: boolean
  onConfirm: () => void
}

export function DeleteComboTourDialog({
  open,
  onOpenChange,
  tourTitle,
  deleting,
  onConfirm,
}: DeleteComboTourDialogProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Delete combo tour"
      description={
        tourTitle
          ? `Are you sure you want to delete "${tourTitle}"? This action cannot be undone.`
          : "Are you sure you want to delete this combo tour? This action cannot be undone."
      }
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
