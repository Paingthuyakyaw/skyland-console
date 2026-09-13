/* eslint-disable react-refresh/only-export-components */
import PromotionEditorPage from "@/features/promotions/editor"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/promotions/$id")({
  component: EditPromotionPage,
})

function EditPromotionPage() {
  const { id } = Route.useParams()
  return <PromotionEditorPage promotionId={id} />
}
