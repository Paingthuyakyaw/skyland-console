import { useEffect, useMemo, useState } from "react"
import { Check, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StaffBreadcrumbs } from "@/features/staff/components/staff-breadcrumbs"
import {
  flattenMenus,
  isAdminRole,
  roleBadgeClass,
} from "@/features/staff/components/utils"
import { useMenuTree } from "@/store/server/staff/menus"
import {
  useReplaceRolePermissions,
  useRoles,
  useRolesPermissions,
} from "@/store/server/staff/roles"
import { cn } from "@/lib/utils"

const PermissionsFeature = () => {
  const {
    data: rolesPage,
    isPending: rolesPending,
    isError: rolesError,
  } = useRoles({ size: 100, sort: "name", direction: "asc" })
  const {
    data: menus = [],
    isPending: menusPending,
    isError: menusError,
  } = useMenuTree()
  const roles = useMemo(() => rolesPage?.content ?? [], [rolesPage?.content])
  const roleIds = useMemo(() => roles.map((role) => role.id), [roles])
  const pages = flattenMenus(menus)
  const allMenuIds = useMemo(() => pages.map((page) => page.id), [pages])
  const permissionQueries = useRolesPermissions(roleIds)
  const replacePermissions = useReplaceRolePermissions()
  const [ui, setUi] = useState<{
    access: Record<string, string[]>
    dirtyRoleIds: string[]
    initialized: boolean
    saving: boolean
  }>({
    access: {},
    dirtyRoleIds: [],
    initialized: false,
    saving: false,
  })
  const roleKey = roleIds.join("|")
  const menuKey = allMenuIds.join("|")

  const permissionsReady =
    !rolesPending &&
    !menusPending &&
    (roles.length === 0 || permissionQueries.every((query) => !query.isPending))

  useEffect(() => {
    setUi((current) => ({
      ...current,
      initialized: false,
      dirtyRoleIds: [],
    }))
  }, [menuKey, roleKey])

  useEffect(() => {
    if (ui.initialized || !permissionsReady) return

    const next: Record<string, string[]> = {}
    for (const [index, role] of roles.entries()) {
      next[role.id] = isAdminRole(role)
        ? allMenuIds
        : (permissionQueries[index]?.data?.menuIds ?? [])
    }
    setUi((current) => ({
      ...current,
      access: next,
      dirtyRoleIds: [],
      initialized: true,
    }))
  }, [allMenuIds, ui.initialized, permissionQueries, permissionsReady, roles])

  const toggle = (menuId: string, roleId: string, admin: boolean) => {
    if (admin) return
    setUi((current) => {
      const selected = new Set(current.access[roleId] ?? [])
      if (selected.has(menuId)) selected.delete(menuId)
      else selected.add(menuId)
      return {
        ...current,
        access: { ...current.access, [roleId]: [...selected] },
        dirtyRoleIds: current.dirtyRoleIds.includes(roleId)
          ? current.dirtyRoleIds
          : [...current.dirtyRoleIds, roleId],
      }
    })
  }

  const handleSave = async () => {
    const rolesToSave = roles.filter(
      (role) => !isAdminRole(role) && ui.dirtyRoleIds.includes(role.id)
    )
    if (rolesToSave.length === 0) {
      toast.message("No permission changes to save")
      return
    }

    setUi((current) => ({ ...current, saving: true }))
    try {
      for (const role of rolesToSave) {
        await replacePermissions.mutateAsync({
          id: role.id,
          menuIds: ui.access[role.id] ?? [],
        })
      }
      setUi((current) => ({ ...current, dirtyRoleIds: [], saving: false }))
      toast.success("Permissions saved")
    } catch {
      setUi((current) => ({ ...current, saving: false }))
    }
  }

  const loading = rolesPending || menusPending || !ui.initialized

  return (
    <div>
      <StaffBreadcrumbs
        items={[
          { label: "Staff Management", to: "/staff" },
          { label: "Role Permissions" },
        ]}
      />
      <PagePlaceholder
        title="Role Permissions"
        subtitle="Configure which pages each role can access across the system."
        actions={
          <Button
            type="button"
            disabled={ui.saving || loading || roles.length === 0}
            onClick={() => {
              void handleSave()
            }}
          >
            {ui.saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-foreground">Page Access Matrix</h3>
            <p className="text-xs text-muted-foreground">
              Click cells to toggle access. Admin always has full access.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Menu / Page
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="px-4 py-3 text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    <Badge
                      className={cn(
                        "border-transparent text-[10px] font-bold",
                        roleBadgeClass(role)
                      )}
                    >
                      {role.name}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page, index) => (
                <tr
                  key={page.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    index % 2 === 0 ? "" : "bg-muted/10"
                  )}
                >
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-foreground">
                      {page.label}
                    </span>
                  </td>
                  {roles.map((role) => {
                    const granted = (ui.access[role.id] ?? []).includes(page.id)
                    const admin = isAdminRole(role)
                    return (
                      <td key={role.id} className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggle(page.id, role.id, admin)}
                          disabled={admin || ui.saving}
                          title={
                            admin
                              ? "Admin always has full access"
                              : granted
                                ? "Click to revoke"
                                : "Click to grant"
                          }
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all",
                            granted
                              ? "bg-secondary-soft text-secondary-foreground hover:bg-secondary/20"
                              : "bg-muted text-muted-foreground hover:bg-muted/80",
                            admin && "cursor-not-allowed opacity-80"
                          )}
                        >
                          {granted ? (
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          ) : (
                            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Loading permissions…
          </p>
        ) : null}

        {rolesError || menusError ? (
          <p className="px-6 py-12 text-center text-sm text-destructive">
            Failed to load roles or menus.
          </p>
        ) : null}

        {!loading && !rolesError && !menusError && pages.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No menu pages were returned.
          </p>
        ) : null}

        <div className="flex items-center gap-5 border-t border-border px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary-soft text-secondary-foreground">
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            Granted
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X className="h-3 w-3" strokeWidth={2.5} />
            </span>
            No Access
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PermissionsFeature
