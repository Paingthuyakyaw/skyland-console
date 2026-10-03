/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"
import { ProductReviewsPage } from "@/features/reviews"

export const Route = createFileRoute(
  "/_authenticated/holiday-packages/$id_/reviews"
)({ component: ReviewsPage })

function ReviewsPage() {
  const { id } = Route.useParams()
  return <ProductReviewsPage key={id} type="holiday-packages" id={id} />
}
