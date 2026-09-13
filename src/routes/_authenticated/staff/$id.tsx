/* eslint-disable react-refresh/only-export-components */
import StaffDetailPage from "@/features/staff/detail"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/staff/$id")({
  component: StaffMemberPage,
})

function StaffMemberPage() {
  const { id } = Route.useParams()
  return <StaffDetailPage staffId={id} />
}
