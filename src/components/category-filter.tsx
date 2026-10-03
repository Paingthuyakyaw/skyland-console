import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CategoryFilter({
  value,
  categories,
  onChange,
}: {
  value: string
  categories: Array<{ id: string; name: string }>
  onChange: (value: string) => void
}) {
  return (
    <Select
      items={{
        all: "All categories",
        ...Object.fromEntries(
          categories.map((category) => [category.id, category.name])
        ),
      }}
      value={value || "all"}
      onValueChange={(next) => {
        if (typeof next === "string") onChange(next === "all" ? "" : next)
      }}
    >
      <SelectTrigger className="w-full sm:w-64" aria-label="Filter by category">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
