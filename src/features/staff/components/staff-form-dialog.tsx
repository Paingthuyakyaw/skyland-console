import { useEffect, useState } from "react"
import { toast } from "sonner"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createInitialStaffForm,
  staffRolesToItems,
  validateStaffForm,
  type StaffFormState,
} from "@/features/staff/components/utils"
import { useCreateStaff, useUpdateStaff } from "@/store/server/staff/staff"
import { useRoles } from "@/store/server/staff/roles"
import type { StaffResponse, StaffStatus } from "@/store/server/staff/typed"

const STATUS_ITEMS = {
  ACTIVE: "Active",
  LOCKED: "Locked",
} as const

type StaffFormDialogProps = {
  open: boolean
  staff?: StaffResponse | null
  onOpenChange: (open: boolean) => void
}

export function StaffFormDialog({
  open,
  staff,
  onOpenChange,
}: StaffFormDialogProps) {
  const isEdit = Boolean(staff)
  const [form, setForm] = useState<StaffFormState>(() =>
    createInitialStaffForm(staff)
  )
  const { data: rolesPage, isPending: rolesPending } = useRoles(
    { size: 100, sort: "name", direction: "asc" },
    open
  )
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()
  const roles = rolesPage?.content ?? []
  const roleItems = staffRolesToItems(roles)
  const saving = createStaff.isPending || updateStaff.isPending

  useEffect(() => {
    if (!open) return
    setForm(createInitialStaffForm(staff))
  }, [open, staff])

  const patch = (next: Partial<StaffFormState>) => {
    setForm((current) => ({ ...current, ...next }))
  }

  const handleSave = () => {
    const mode = isEdit ? "edit" : "create"
    const error = validateStaffForm(form, mode)
    if (error) {
      toast.error(error)
      return
    }

    if (isEdit && staff) {
      updateStaff.mutate(
        {
          id: staff.id,
          staff: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            password: form.password || undefined,
            roleId: form.roleId,
            status: form.status,
          },
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      )
      return
    }

    createStaff.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        roleId: form.roleId,
        status: form.status,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <CustomDialog
      open={open}
      onOpenChange={(next) => {
        if (!saving) onOpenChange(next)
      }}
      title={isEdit ? "Edit staff" : "Add staff"}
      showDone={false}
      contentClassName="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={saving} onClick={handleSave}>
            {saving
              ? isEdit
                ? "Saving…"
                : "Adding…"
              : isEdit
                ? "Save changes"
                : "Add staff"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field>
          <FieldLabel htmlFor="staff-name">Full name</FieldLabel>
          <Input
            id="staff-name"
            value={form.name}
            onChange={(event) => patch({ name: event.target.value })}
            placeholder="Sara Nasser"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="staff-email">Email</FieldLabel>
          <Input
            id="staff-email"
            type="email"
            value={form.email}
            onChange={(event) => patch({ email: event.target.value })}
            placeholder="sara@skyland.ae"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="staff-phone">Phone</FieldLabel>
          <Input
            id="staff-phone"
            value={form.phone}
            onChange={(event) => patch({ phone: event.target.value })}
            placeholder="+971 50 000 0000"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="staff-password">
            {isEdit ? "New password" : "Password"}
          </FieldLabel>
          <Input
            id="staff-password"
            type="password"
            value={form.password}
            onChange={(event) => patch({ password: event.target.value })}
            placeholder={
              isEdit ? "Leave blank to keep current password" : undefined
            }
          />
          <p className="text-xs text-muted-foreground">
            Minimum 12 characters{isEdit ? ". Optional when editing." : "."}
          </p>
        </Field>
        <Field>
          <FieldLabel>Role assignment</FieldLabel>
          <Select
            items={roleItems}
            value={form.roleId || null}
            onValueChange={(value) => {
              if (typeof value === "string") patch({ roleId: value })
            }}
            disabled={rolesPending || roles.length === 0}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue
                placeholder={rolesPending ? "Loading roles…" : "Select a role"}
              />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            items={STATUS_ITEMS}
            value={form.status}
            onValueChange={(value) => {
              if (value === "ACTIVE" || value === "LOCKED") {
                patch({ status: value as StaffStatus })
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </CustomDialog>
  )
}
