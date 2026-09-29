/* eslint-disable react-refresh/only-export-components */
import ComboTourFormPage from "@/features/combo-tours/create"
import { assertComboToursEnabled } from "@/lib/feature-flags"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/combo-tours/$id")({
  beforeLoad: assertComboToursEnabled,
  component: EditComboTourPage,
})

function EditComboTourPage() {
  const { id } = Route.useParams()
  return <ComboTourFormPage comboTourId={id} />
}
