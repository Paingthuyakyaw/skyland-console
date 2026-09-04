/* eslint-disable react-refresh/only-export-components */
import PaymentsPage from "@/features/payments"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/payments/")({
  component: PaymentsPage,
})
