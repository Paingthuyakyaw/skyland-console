import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Plus, ShieldCheck } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Button } from "@/components/ui/button"
import { StaffFormDialog } from "@/features/staff/components/staff-form-dialog"
import { StaffTable } from "@/features/staff/components/staff-table"
import { useStaffList } from "@/store/server/staff/staff"
import type { StaffResponse } from "@/store/server/staff/typed"

const PAGE_SIZE = 10

type StaffUi = {
  adding: boolean
  editing: StaffResponse | null
  page: number
}

const StaffFeature = () => {
  const navigate = useNavigate()
  const [ui, setUi] = useState<StaffUi>({
    adding: false,
    editing: null,
    page: 0,
  })
  const { data, isPending, isError } = useStaffList({
    page: ui.page,
    size: PAGE_SIZE,
    sort: "name",
    direction: "asc",
  })
  const staff = data?.content ?? []
  const totalElements = data?.totalElements ?? staff.length
  const totalPages =
    data?.totalPages && data.totalPages > 0
      ? data.totalPages
      : staff.length > 0
        ? Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
        : 0

  useEffect(() => {
    if (totalPages > 0 && ui.page > totalPages - 1) {
      setUi((current) => ({ ...current, page: totalPages - 1 }))
    }
  }, [ui.page, totalPages])

  return (
    <div>
      <PagePlaceholder
        title="Staff Management"
        subtitle="Manage team members, roles and access permissions."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigate({ to: "/staff/permissions" })
              }}
            >
              <ShieldCheck />
              Manage Permissions
            </Button>
            <Button
              type="button"
              onClick={() => setUi((current) => ({ ...current, adding: true }))}
            >
              <Plus />
              Add Staff
            </Button>
          </>
        }
      />

      <StaffTable
        staff={staff}
        isPending={isPending}
        isError={isError}
        page={ui.page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(page) => setUi((current) => ({ ...current, page }))}
        onView={(member) => {
          void navigate({ to: "/staff/$id", params: { id: member.id } })
        }}
        onEdit={(editing) => setUi((current) => ({ ...current, editing }))}
      />

      <StaffFormDialog
        open={ui.adding}
        onOpenChange={(adding) => setUi((current) => ({ ...current, adding }))}
      />
      <StaffFormDialog
        open={ui.editing !== null}
        staff={ui.editing}
        onOpenChange={(open) => {
          if (!open) setUi((current) => ({ ...current, editing: null }))
        }}
      />
    </div>
  )
}

export default StaffFeature
