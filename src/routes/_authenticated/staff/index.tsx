/* eslint-disable react-refresh/only-export-components */
import StaffPage from "@/features/staff"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/staff/")({
  component: StaffPage,
})
