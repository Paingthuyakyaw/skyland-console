/* eslint-disable react-refresh/only-export-components */
import ComboToursPage from "@/features/combo-tours"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/combo-tours/")({
  component: ComboToursPage,
})
