/* eslint-disable react-refresh/only-export-components */
import PermissionsPage from "@/features/staff/permissions"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/staff/permissions")({
  component: PermissionsPage,
})
