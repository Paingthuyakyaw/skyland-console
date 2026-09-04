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

export type AdminNavItem = {
  label: string
  to: LinkProps["to"]
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Bookings", to: "/bookings", icon: Calendar },
  { label: "Tours", to: "/tours", icon: Package },
  { label: "Promotions & Coupons", to: "/promotions", icon: TicketPercent },
  { label: "Holiday Package", to: "/holiday-packages", icon: CakeSlice },
  { label: "Combo Tours", to: "/combo-tours", icon: Layers2 },
  { label: "Inquiries", to: "/inquiries", icon: Inbox },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Staff", to: "/staff", icon: UsersRound },
  { label: "Payments & Revenue", to: "/payments", icon: CreditCard },
  { label: "Reports", to: "/reports", icon: FileChartColumn },
  { label: "Website Content", to: "/website", icon: Globe },
  { label: "Settings", to: "/settings", icon: Settings },
]
