/* eslint-disable react-refresh/only-export-components */
import BookingsPage from "@/features/bookings"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/bookings/")({
  component: BookingsPage,
})
