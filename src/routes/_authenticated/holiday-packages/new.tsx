/* eslint-disable react-refresh/only-export-components */
import CreateHolidayPackagePage from "@/features/holiday-packages/create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/holiday-packages/new")({
  component: CreateHolidayPackagePage,
})
