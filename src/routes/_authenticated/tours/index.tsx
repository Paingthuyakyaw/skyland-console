/* eslint-disable react-refresh/only-export-components */
import ToursPage from "@/features/tours"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/tours/")({
  component: ToursPage,
})
