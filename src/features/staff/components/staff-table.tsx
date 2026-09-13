import { Pencil } from "lucide-react"

import { ListPagination } from "@/components/list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  formatLastLogin,
  roleBadgeClass,
  staffInitials,
  staffPresenceClass,
  staffPresenceLabel,
} from "@/features/staff/components/utils"
import type { StaffResponse } from "@/store/server/staff/typed"

type StaffTableProps = {
  staff: StaffResponse[]
  isPending: boolean
  isError: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onView: (staff: StaffResponse) => void
  onEdit: (staff: StaffResponse) => void
}

export function StaffTable({
  staff,
  isPending,
  isError,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onView,
  onEdit,
}: StaffTableProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead className="border-b border-border bg-muted/45">
            <tr>
              {["Name", "Role", "Email", "Status", "Last login", ""].map(
                (label) => (
                  <th
                    key={label || "actions"}
                    className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((member) => (
              <tr
                key={member.id}
                onClick={() => onView(member)}
                className="cursor-pointer transition-colors hover:bg-primary-soft/35"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-soft text-xs font-black text-secondary-foreground">
                      {staffInitials(member.name)}
                    </div>
                    <span className="font-medium text-foreground">
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge
                    className={`border-transparent font-bold ${roleBadgeClass(member.role)}`}
                  >
                    {member.role?.name || "Unassigned"}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {member.email}
                </td>
                <td className="px-4 py-4">
                  <Badge
                    className={`border-transparent font-bold ${staffPresenceClass(member)}`}
                  >
                    {staffPresenceLabel(member)}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground">
                  {formatLastLogin(member.lastLoginAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${member.name}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit(member)
                      }}
                    >
                      <Pencil />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading staff…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Failed to load staff.
        </p>
      ) : null}

      {!isPending && !isError && staff.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No staff members yet.
        </p>
      ) : null}

      {!isPending && !isError ? (
        <ListPagination
          className="border-t border-border px-4 py-3"
          page={page}
          size={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={onPageChange}
        />
      ) : null}
    </Card>
  )
}
