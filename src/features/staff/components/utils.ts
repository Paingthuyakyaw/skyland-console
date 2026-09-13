import type {
  MenuNode,
  RoleResponse,
  RoleSummary,
  StaffResponse,
  StaffStatus,
} from "@/store/server/staff/typed"

export function staffInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function isAdminRole(role?: Pick<RoleSummary, "name" | "code"> | null) {
  if (!role) return false
  return (
    role.code.trim().toUpperCase() === "ADMIN" ||
    role.name.trim().toLowerCase() === "admin"
  )
}

export function roleBadgeClass(
  role?: Pick<RoleSummary, "name" | "code"> | null
) {
  const key = `${role?.code ?? ""} ${role?.name ?? ""}`.toUpperCase()
  if (key.includes("ADMIN")) return "bg-type-combo-bg text-type-combo"
  if (key.includes("MANAGER")) return "bg-primary-soft text-primary"
  if (key.includes("SALES")) {
    return "bg-secondary-soft text-secondary-foreground"
  }
  if (key.includes("OPERATION") || key.includes("OPS")) {
    return "bg-type-package-bg text-type-package"
  }
  if (key.includes("DRIVER")) return "bg-muted text-muted-foreground"
  return "bg-primary-soft text-primary"
}

export function staffPresenceLabel(staff: StaffResponse) {
  if (staff.status === "LOCKED") return "Locked"
  return staff.online ? "Online" : "Offline"
}

export function staffPresenceClass(staff: StaffResponse) {
  if (staff.status === "LOCKED") {
    return "bg-status-cancelled-bg text-status-cancelled"
  }
  if (staff.online) return "bg-status-confirmed-bg text-status-confirmed"
  return "bg-muted text-muted-foreground"
}

export function formatLastLogin(value?: string | null) {
  if (!value) return "Never"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Never"

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.round(diffMs / 60_000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`

  const diffHr = Math.round(diffMin / 60)
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  if (sameDay) return `${diffHr} hr ago`

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  if (isYesterday) return `Yesterday, ${time}`

  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })}, ${time}`
}

export function flattenMenus(nodes: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = []

  const walk = (items: MenuNode[]) => {
    for (const item of items) {
      result.push(item)
      if (item.children?.length) walk(item.children)
    }
  }

  walk(nodes)
  return result
}

export type StaffFormState = {
  name: string
  email: string
  phone: string
  password: string
  roleId: string
  status: StaffStatus
}

export function createInitialStaffForm(
  staff?: StaffResponse | null
): StaffFormState {
  return {
    name: staff?.name ?? "",
    email: staff?.email ?? "",
    phone: staff?.phone ?? "",
    password: "",
    roleId: staff?.role?.id ?? "",
    status: staff?.status ?? "ACTIVE",
  }
}

export function validateStaffForm(
  form: StaffFormState,
  mode: "create" | "edit"
) {
  if (!form.name.trim()) return "Full name is required"
  if (!form.email.trim()) return "Email is required"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Enter a valid email"
  }
  if (!form.roleId) return "Role assignment is required"
  if (mode === "create" && form.password.length < 12) {
    return "Password must be at least 12 characters"
  }
  if (mode === "edit" && form.password && form.password.length < 12) {
    return "Password must be at least 12 characters"
  }
  return null
}

export function staffRolesToItems(roles: RoleResponse[]) {
  return Object.fromEntries(roles.map((role) => [role.id, role.name]))
}
