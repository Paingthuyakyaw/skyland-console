/* eslint-disable react-refresh/only-export-components */
import CreateTourPage from "@/features/tours/create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/tours/$id")({
  component: EditTourPage,
})

function EditTourPage() {
  const { id } = Route.useParams()
  return <CreateTourPage tourId={id} />
}
