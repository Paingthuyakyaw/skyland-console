/* eslint-disable react-refresh/only-export-components */
import DashboardPage from "@/features/dashboard"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
})
