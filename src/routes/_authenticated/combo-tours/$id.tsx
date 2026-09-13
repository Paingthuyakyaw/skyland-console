/* eslint-disable react-refresh/only-export-components */
import ComboTourFormPage from "@/features/combo-tours/create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/combo-tours/$id")({
  component: EditComboTourPage,
})

function EditComboTourPage() {
  const { id } = Route.useParams()
  return <ComboTourFormPage comboTourId={id} />
}
