import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { PagePlaceholder } from "@/components/page-placeholder"
import { CouponEditorForm } from "@/features/promotions/components/coupon-editor-form"
import {
  buildPromotionRequest,
  createInitialCouponForm,
  promotionToForm,
  validateCouponForm,
  type CouponFormState,
} from "@/features/promotions/coupon-form"
import {
  useCreatePromotion,
  useGeneratePromotionCode,
  usePromotion,
  useUpdatePromotion,
} from "@/store/server/promotions/promotions"
import { useTourCategories } from "@/store/server/tours/categories"
import { useTours } from "@/store/server/tours/tours"

type PromotionEditorFeatureProps = {
  promotionId?: string
}

const PromotionEditorFeature = ({
  promotionId,
}: PromotionEditorFeatureProps) => {
  const navigate = useNavigate()
  const isEdit = Boolean(promotionId)
  const [form, setForm] = useState<CouponFormState>(createInitialCouponForm)
  const promotionQuery = usePromotion(promotionId ?? "", isEdit)
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()
  const generateCode = useGeneratePromotionCode()
  const { data: primaryCategories = [] } = useTourCategories(true, {
    level: "PRIMARY",
  })
  const { data: secondaryCategories = [] } = useTourCategories(true, {
    level: "SECONDARY",
  })
  const { data: toursPage } = useTours({ size: 100 })
  const categories = [...primaryCategories, ...secondaryCategories]
  const tours = toursPage?.content ?? []
  const saving = createPromotion.isPending || updatePromotion.isPending

  useEffect(() => {
    if (promotionQuery.data) {
      setForm(promotionToForm(promotionQuery.data))
    }
  }, [promotionQuery.data])

  const goBack = () => {
    void navigate({ to: "/promotions" })
  }

  const handleGenerateCode = () => {
    generateCode.mutate(
      { prefix: "SKY", randomLength: 6 },
      {
        onSuccess: (result) => {
          if (result?.code) {
            setForm((current) => ({
              ...current,
              code: result.code.toUpperCase(),
            }))
          }
        },
      }
    )
  }

  const handleSave = () => {
    const errors = validateCouponForm(form)
    if (errors.length > 0) {
      toast.error(errors[0])
      return
    }

    const payload = buildPromotionRequest(form)

    if (isEdit && promotionId) {
      const version = form.version
      if (typeof version !== "number") {
        toast.error("This coupon cannot be saved yet. Reload and try again.")
        return
      }

      updatePromotion.mutate(
        { id: promotionId, version, promotion: payload },
        { onSuccess: goBack }
      )
      return
    }

    createPromotion.mutate(payload, { onSuccess: goBack })
  }

  if (isEdit && promotionQuery.isPending) {
    return (
      <div>
        <PagePlaceholder
          title="Edit coupon"
          subtitle="Loading coupon details…"
          actions={
            <Button type="button" variant="outline" onClick={goBack}>
              Cancel
            </Button>
          }
        />
      </div>
    )
  }

  if (isEdit && (promotionQuery.isError || !promotionQuery.data)) {
    return (
      <div>
        <PagePlaceholder
          title="Coupon not found"
          subtitle="This coupon could not be loaded."
          actions={
            <Button type="button" variant="outline" onClick={goBack}>
              Back to coupons
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <PagePlaceholder
        title={isEdit ? `Edit ${form.code || "Coupon"}` : "Add New Coupon"}
        subtitle="Create, target, and monitor checkout offers across your tours."
        actions={
          <>
            <Button type="button" variant="outline" onClick={goBack}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : "Save Coupon"}
            </Button>
          </>
        }
      />

      <CouponEditorForm
        form={form}
        onChange={setForm}
        categories={categories}
        tours={tours}
        generatingCode={generateCode.isPending}
        onGenerateCode={handleGenerateCode}
      />
    </div>
  )
}

export default PromotionEditorFeature
