/* eslint-disable react-refresh/only-export-components */
import InquiriesPage from "@/features/inquiries"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/inquiries/")({
  component: InquiriesPage,
})
