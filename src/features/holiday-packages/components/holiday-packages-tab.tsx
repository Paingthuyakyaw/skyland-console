import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { HolidayPackageCard } from "@/features/holiday-packages/components/holiday-package-card"
import type { HolidayPackage } from "@/store/server/holiday/typed"

type HolidayPackagesTabProps = {
  search: string
  onSearchChange: (value: string) => void
  packages: HolidayPackage[]
  isPending: boolean
  isError: boolean
  deleting: boolean
  onRequestDelete: (pkg: HolidayPackage) => void
}

export function HolidayPackagesTab({
  search,
  onSearchChange,
  packages,
  isPending,
  isError,
  deleting,
  onRequestDelete,
}: HolidayPackagesTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search holiday packages"
        />
      </div>

      {isPending ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading holiday packages…
        </p>
      ) : null}

      {isError ? (
        <p className="py-10 text-center text-sm text-destructive">
          Failed to load holiday packages.
        </p>
      ) : null}

      {!isPending && !isError && packages.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No holiday packages yet.
        </p>
      ) : null}

      {!isPending && !isError && packages.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg) => (
            <HolidayPackageCard
              key={pkg.id}
              pkg={pkg}
              deleting={deleting}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
