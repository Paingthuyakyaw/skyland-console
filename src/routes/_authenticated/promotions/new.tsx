/* eslint-disable react-refresh/only-export-components */
import PromotionEditorPage from "@/features/promotions/editor"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/promotions/new")({
  component: PromotionEditorPage,
})
