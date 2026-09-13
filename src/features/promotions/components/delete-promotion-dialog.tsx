import { Button } from "@/components/ui/button"
import { CustomDialog } from "@/components/custom-dialog"

type DeletePromotionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  couponCode?: string
  deleting: boolean
  onConfirm: () => void
}

export function DeletePromotionDialog({
  open,
  onOpenChange,
  couponCode,
  deleting,
  onConfirm,
}: DeletePromotionDialogProps) {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Delete coupon"
      description={
        couponCode
          ? `Are you sure you want to delete "${couponCode}"? This action cannot be undone.`
          : "Are you sure you want to delete this coupon? This action cannot be undone."
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
