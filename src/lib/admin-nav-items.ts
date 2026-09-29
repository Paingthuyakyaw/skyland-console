import type { LinkProps } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import {
  CakeSlice,
  Calendar,
  CreditCard,
  FileChartColumn,
  Globe,
  Inbox,
  Layers2,
  LayoutDashboard,
  Package,
  Settings,
  TicketPercent,
  Users,
  UsersRound,
} from "lucide-react"

import { COMBO_TOURS_ENABLED } from "@/lib/feature-flags"

export type AdminNavItem = {
  label: string
  to: LinkProps["to"]
  icon: LucideIcon
}

const comboTourNavItems: AdminNavItem[] = COMBO_TOURS_ENABLED
  ? [{ label: "Combo Tours", to: "/combo-tours", icon: Layers2 }]
  : []

const comboQuoteNavItems: AdminNavItem[] = COMBO_TOURS_ENABLED
  ? [{ label: "Combo Tour Quotes", to: "/combo-quotes", icon: Layers2 }]
  : []

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Tour Bookings", to: "/bookings", icon: Calendar },
  { label: "Tours", to: "/tours", icon: Package },
  { label: "Promotions & Coupons", to: "/promotions", icon: TicketPercent },
  ...comboTourNavItems,
  { label: "Tour Inquiries", to: "/inquiries", icon: Inbox },
  ...comboQuoteNavItems,
  { label: "Holiday Package Quotes", to: "/holiday-quotes", icon: CakeSlice },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Staff", to: "/staff", icon: UsersRound },
  { label: "Payments & Revenue", to: "/payments", icon: CreditCard },
  { label: "Reports", to: "/reports", icon: FileChartColumn },
  { label: "Website Content", to: "/website", icon: Globe },
  { label: "Settings", to: "/settings", icon: Settings },
]
