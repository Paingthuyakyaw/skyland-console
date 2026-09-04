/* eslint-disable react-refresh/only-export-components */
import WebsitePage from "@/features/website"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/website/")({
  component: WebsitePage,
})
