/* eslint-disable react-refresh/only-export-components */
import CreateComboTourPage from "@/features/combo-tours/create"
import { assertComboToursEnabled } from "@/lib/feature-flags"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/combo-tours/new")({
  beforeLoad: assertComboToursEnabled,
  component: CreateComboTourPage,
})
