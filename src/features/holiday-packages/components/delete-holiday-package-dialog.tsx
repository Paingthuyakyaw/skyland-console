import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/custom-dialog"

type DeleteHolidayPackageDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  packageTitle?: string
  deleting: boolean
  onConfirm: () => void
}

export function DeleteHolidayPackageDialog({
  open,
  onOpenChange,
  packageTitle,
  deleting,
  onConfirm,
}: DeleteHolidayPackageDialogProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Delete holiday package"
      description={
        packageTitle
          ? `Are you sure you want to delete "${packageTitle}"? This action cannot be undone.`
          : "Are you sure you want to delete this holiday package? This action cannot be undone."
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
