/* eslint-disable react-refresh/only-export-components */
import HolidayPackagesPage from "@/features/holiday-packages"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/holiday-packages/")({
  component: HolidayPackagesPage,
})
