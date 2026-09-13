import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/custom-dialog"

type DeleteStaffDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  staffName?: string
  deleting: boolean
  onConfirm: () => void
}

export function DeleteStaffDialog({
  open,
  onOpenChange,
  staffName,
  deleting,
  onConfirm,
}: DeleteStaffDialogProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Delete staff"
      description={
        staffName
          ? `Are you sure you want to delete "${staffName}"? This action cannot be undone.`
          : "Are you sure you want to delete this staff member? This action cannot be undone."
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
