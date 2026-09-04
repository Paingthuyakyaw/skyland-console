/* eslint-disable react-refresh/only-export-components */
import SettingsPage from "@/features/settings"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
})
