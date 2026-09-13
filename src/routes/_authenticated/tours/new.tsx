/* eslint-disable react-refresh/only-export-components */
import CreateTourPage from "@/features/tours/create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/tours/new")({
  component: CreateTourPage,
})
