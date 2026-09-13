import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Mail, Pencil, Trash2 } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DeleteStaffDialog } from "@/features/staff/components/delete-staff-dialog"
import { StaffBreadcrumbs } from "@/features/staff/components/staff-breadcrumbs"
import { StaffFormDialog } from "@/features/staff/components/staff-form-dialog"
import {
  flattenMenus,
  formatLastLogin,
  roleBadgeClass,
  staffInitials,
  staffPresenceClass,
  staffPresenceLabel,
} from "@/features/staff/components/utils"
import { useMenuTree } from "@/store/server/staff/menus"
import { useRolePermissions } from "@/store/server/staff/roles"
import { useDeleteStaff, useStaff } from "@/store/server/staff/staff"

type StaffDetailFeatureProps = {
  staffId: string
}

const StaffDetailFeature = ({ staffId }: StaffDetailFeatureProps) => {
  const navigate = useNavigate()
  const [ui, setUi] = useState({ editing: false, deleting: false })
  const { data: staff, isPending, isError } = useStaff(staffId)
  const { data: menus = [] } = useMenuTree(Boolean(staff))
  const { data: permissions } = useRolePermissions(
    staff?.role?.id ?? "",
    Boolean(staff?.role?.id)
  )
  const deleteStaff = useDeleteStaff()
  const pages = flattenMenus(menus)
  const allowed = new Set(permissions?.menuIds ?? [])

  if (isPending) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading staff…
      </p>
    )
  }

  if (isError || !staff) {
    return (
      <p className="py-12 text-center text-sm text-destructive">
        Failed to load staff member.
      </p>
    )
  }

  return (
    <div>
      <StaffBreadcrumbs
        items={[
          { label: "Staff Management", to: "/staff" },
          { label: staff.name },
        ]}
      />
      <PagePlaceholder
        title={staff.name}
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setUi((current) => ({ ...current, deleting: true }))
              }
            >
              <Trash2 />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setUi((current) => ({ ...current, editing: true }))
              }
            >
              <Pencil />
              Edit staff/role
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-soft text-lg font-black text-secondary-foreground">
              {staffInitials(staff.name)}
            </div>
            <div>
              <div className="text-lg font-black text-foreground">
                {staff.name}
              </div>
              <Badge
                className={`mt-1 border-transparent font-bold ${roleBadgeClass(staff.role)}`}
              >
                {staff.role?.name || "Unassigned"}
              </Badge>
            </div>
          </div>
          <div className="mt-4 space-y-2.5 border-t border-border pt-4 text-sm">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {staff.email}
            </div>
            {staff.phone ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{staff.phone}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                className={`border-transparent font-bold ${staffPresenceClass(staff)}`}
              >
                {staffPresenceLabel(staff)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last login</span>
              <span className="font-medium">
                {formatLastLogin(staff.lastLoginAt)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 font-bold text-foreground">
            Page access for {staff.role?.name || "this role"}
          </h3>
          {pages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No menu permissions were returned for this role.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {pages.map((page) => {
                const granted = allowed.has(page.id)
                return (
                  <div
                    key={page.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="text-foreground">{page.label}</span>
                    {granted ? (
                      <Badge className="border-transparent bg-secondary-soft font-bold text-secondary-foreground">
                        Allowed
                      </Badge>
                    ) : (
                      <Badge className="border-transparent bg-muted font-bold text-muted-foreground">
                        No access
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <StaffFormDialog
        open={ui.editing}
        staff={staff}
        onOpenChange={(editing) =>
          setUi((current) => ({ ...current, editing }))
        }
      />
      <DeleteStaffDialog
        open={ui.deleting}
        staffName={staff.name}
        deleting={deleteStaff.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteStaff.isPending) {
            setUi((current) => ({ ...current, deleting: false }))
          }
        }}
        onConfirm={() => {
          deleteStaff.mutate(
            { id: staff.id },
            {
              onSuccess: () => {
                setUi((current) => ({ ...current, deleting: false }))
                void navigate({ to: "/staff" })
              },
            }
          )
        }}
      />
    </div>
  )
}

export default StaffDetailFeature
