/* eslint-disable react-refresh/only-export-components */
import CustomersPage from "@/features/customers"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/customers/")({
  component: CustomersPage,
})
