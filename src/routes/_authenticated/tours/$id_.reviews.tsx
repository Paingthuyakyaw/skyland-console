/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"
import { ProductReviewsPage } from "@/features/reviews"

export const Route = createFileRoute("/_authenticated/tours/$id_/reviews")({
  component: ReviewsPage,
})

function ReviewsPage() {
  const { id } = Route.useParams()
  return <ProductReviewsPage key={id} type="tours" id={id} />
}
