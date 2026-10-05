import type { PrivateTourOption } from "@/store/server/tours/typed"

export function PrivateTourOptionsSummary({
  options,
  prices,
}: {
  options: PrivateTourOption[]
  prices?: Array<{ id: string; price: number }>
}) {
  if (!options.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold">
        Private tour options · total per booking
      </p>
      {options.map((option, index) => (
        <div
          key={option.id ?? index}
          className="rounded-md border border-border p-2.5"
        >
          <div className="flex items-start justify-between gap-3 text-xs">
            <span className="font-semibold">
              {option.name || `Private option ${index + 1}`}
            </span>
            <span className="shrink-0 font-semibold">
              {new Intl.NumberFormat("en", {
                style: "currency",
                currency: "AED",
              }).format(
                prices?.find((price) => price.id === option.id)?.price ??
                  option.price
              )}
            </span>
          </div>
          {option.description ? (
            <p className="mt-1 text-xs whitespace-pre-line text-muted-foreground">
              {option.description}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
