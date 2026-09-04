/* eslint-disable react-refresh/only-export-components */
import ReportsPage from "@/features/reports"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/reports/")({
  component: ReportsPage,
})
