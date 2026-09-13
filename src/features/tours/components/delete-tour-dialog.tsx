import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/custom-dialog"

type DeleteTourDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourTitle?: string
  deleting: boolean
  onConfirm: () => void
}

export function DeleteTourDialog({
  open,
  onOpenChange,
  tourTitle,
  deleting,
  onConfirm,
}: DeleteTourDialogProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Delete tour"
      description={
        tourTitle
          ? `Are you sure you want to delete "${tourTitle}"? This action cannot be undone.`
          : "Are you sure you want to delete this tour? This action cannot be undone."
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
