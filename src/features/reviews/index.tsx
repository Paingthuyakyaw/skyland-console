import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeft, Star } from "lucide-react"
import { PagePlaceholder } from "@/components/page-placeholder"
import { ListPagination } from "@/components/list-pagination"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useTour } from "@/store/server/tours/tours"
import { useHolidayPackage } from "@/store/server/holiday/packages"
import {
  useCreateProductReview,
  useProductReviews,
  type ReviewProductType,
} from "@/store/server/reviews/reviews"
import { cn } from "@/lib/utils"

export function ProductReviewsPage({
  type,
  id,
}: {
  type: ReviewProductType
  id: string
}) {
  const tour = useTour(id, type === "tours")
  const holidayPackage = useHolidayPackage(id, type === "holiday-packages")
  const product = type === "tours" ? tour : holidayPackage
  const [page, setPage] = useState(0)
  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    rating: 0,
    comment: "",
  })
  const reviews = useProductReviews(type, id, page)
  const createReview = useCreateProductReview(type, id)
  const canSubmit = Boolean(
    form.name.trim() &&
    form.comment.trim() &&
    form.rating > 0 &&
    product.data &&
    !createReview.isPending
  )

  return (
    <div>
      <PagePlaceholder
        title={product.data ? `Reviews · ${product.data.title}` : "Reviews"}
        subtitle="Add a guest review and star rating. Saved reviews appear on the website when the product is published."
        actions={
          <Link to={type === "tours" ? "/tours" : "/holiday-packages"}>
            <span className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted">
              <ArrowLeft className="size-4" /> Back to listing
            </span>
          </Link>
        }
      />
      {product.isError ? (
        <p role="alert" className="mb-4 text-destructive">
          Failed to load this product.
        </p>
      ) : null}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add review</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                if (!canSubmit) return
                createReview.mutate(
                  {
                    ...form,
                    name: form.name.trim(),
                    comment: form.comment.trim(),
                    country: form.country.trim() || undefined,
                    city: form.city.trim() || undefined,
                  },
                  {
                    onSuccess: () => {
                      setForm({
                        name: "",
                        country: "",
                        city: "",
                        rating: 0,
                        comment: "",
                      })
                      setPage(0)
                    },
                  }
                )
              }}
            >
              <Field>
                <FieldLabel htmlFor="review-name">Guest name</FieldLabel>
                <Input
                  id="review-name"
                  required
                  maxLength={160}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="review-country">
                    Country (optional)
                  </FieldLabel>
                  <Input
                    id="review-country"
                    maxLength={120}
                    value={form.country}
                    onChange={(event) =>
                      setForm({ ...form, country: event.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="review-city">City (optional)</FieldLabel>
                  <Input
                    id="review-city"
                    maxLength={120}
                    value={form.city}
                    onChange={(event) =>
                      setForm({ ...form, city: event.target.value })
                    }
                  />
                </Field>
              </div>
              <fieldset>
                <legend className="mb-2 text-sm font-bold">Star rating</legend>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                      aria-pressed={form.rating === rating}
                      onClick={() => setForm({ ...form, rating })}
                    >
                      <Star
                        className={cn(
                          "size-5",
                          rating <= form.rating &&
                            "fill-amber-400 text-amber-500"
                        )}
                      />
                    </Button>
                  ))}
                  <span className="self-center text-sm text-muted-foreground">
                    {form.rating ? `${form.rating}/5` : "Select a rating"}
                  </span>
                </div>
              </fieldset>
              <Field>
                <FieldLabel htmlFor="review-comment">Review</FieldLabel>
                <Textarea
                  id="review-comment"
                  required
                  maxLength={10000}
                  rows={6}
                  value={form.comment}
                  onChange={(event) =>
                    setForm({ ...form, comment: event.target.value })
                  }
                />
              </Field>
              <Button type="submit" disabled={!canSubmit}>
                {createReview.isPending ? "Publishing…" : "Publish review"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h2 className="font-bold">
            Published reviews ({reviews.data?.totalElements ?? 0})
          </h2>
          {reviews.isPending ? (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          ) : null}
          {reviews.isError ? (
            <p role="alert" className="text-sm text-destructive">
              Failed to load reviews.
            </p>
          ) : null}
          {reviews.data?.content.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No published reviews yet.
            </p>
          ) : null}
          {reviews.data?.content.map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[review.city, review.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Star className="size-4 fill-amber-400 text-amber-500" />
                    {review.rating}/5
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{review.comment}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
          <ListPagination
            page={page}
            size={10}
            totalPages={reviews.data?.totalPages ?? 0}
            totalElements={reviews.data?.totalElements ?? 0}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
