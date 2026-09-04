/* eslint-disable react-refresh/only-export-components */
import PromotionsPage from "@/features/promotions"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/promotions/")({
  component: PromotionsPage,
})
