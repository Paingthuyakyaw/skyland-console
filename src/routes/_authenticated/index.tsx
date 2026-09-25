/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" })
  },
})
