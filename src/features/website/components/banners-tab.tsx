import { useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

import { ListPagination } from "@/components/list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BannerFormDialog } from "@/features/website/components/banner-form-dialog"
import { DeleteCmsDialog } from "@/features/website/components/delete-cms-dialog"
import {
  BANNER_TYPE_ITEMS,
  formatCmsDate,
  statusClass,
} from "@/features/website/components/utils"
import {
  useBanners,
  useCreateBanner,
  useDeleteBanner,
  useUpdateBanner,
} from "@/store/server/cms/cms"
import type { BannerRequest, BannerResponse } from "@/store/server/cms/typed"

const PAGE_SIZE = 10

export function BannersTab() {
  const [ui, setUi] = useState<{
    page: number
    formOpen: boolean
    editing: BannerResponse | null
    deleting: BannerResponse | null
  }>({
    page: 0,
    formOpen: false,
    editing: null,
    deleting: null,
  })
  const { data, isPending, isError } = useBanners({
    page: ui.page,
    size: PAGE_SIZE,
  })
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const deleteBanner = useDeleteBanner()
  const banners = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  useEffect(() => {
    if (totalPages > 0 && ui.page > totalPages - 1) {
      setUi((current) => ({ ...current, page: totalPages - 1 }))
    }
  }, [ui.page, totalPages])

  const saving = createBanner.isPending || updateBanner.isPending

  const handleSave = (value: BannerRequest) => {
    if (ui.editing) {
      updateBanner.mutate(
        {
          id: ui.editing.id,
          version: ui.editing.version ?? 0,
          value,
        },
        {
          onSuccess: () => {
            setUi((current) => ({
              ...current,
              formOpen: false,
              editing: null,
            }))
          },
        }
      )
      return
    }

    createBanner.mutate(value, {
      onSuccess: () => setUi((current) => ({ ...current, formOpen: false })),
    })
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-bold text-foreground">Homepage Banners</h3>
        <Button
          type="button"
          onClick={() => {
            setUi((current) => ({
              ...current,
              editing: null,
              formOpen: true,
            }))
          }}
        >
          <Plus />
          Add Banner
        </Button>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40"
          >
            {banner.imageUrl ? (
              <img
                src={banner.imageUrl}
                alt=""
                className="h-12 w-20 rounded-lg object-cover"
              />
            ) : (
              <div className="h-12 w-20 rounded-lg bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-bold text-foreground">{banner.title}</div>
              <div className="text-xs text-muted-foreground">
                {BANNER_TYPE_ITEMS[banner.bannerType]}
                {banner.updatedAt
                  ? ` · Updated ${formatCmsDate(banner.updatedAt)}`
                  : ""}
              </div>
            </div>
            <Badge
              className={`border-transparent font-bold ${statusClass(banner.active)}`}
            >
              {banner.active ? "Active" : "Inactive"}
            </Badge>
            <Switch
              checked={banner.active}
              disabled={updateBanner.isPending}
              onCheckedChange={(active) => {
                updateBanner.mutate({
                  id: banner.id,
                  version: banner.version ?? 0,
                  silent: true,
                  value: {
                    title: banner.title,
                    imageUrl: banner.imageUrl,
                    bannerType: banner.bannerType,
                    active,
                  },
                })
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Edit ${banner.title}`}
              onClick={() => {
                setUi((current) => ({
                  ...current,
                  editing: banner,
                  formOpen: true,
                }))
              }}
            >
              <Pencil />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={`Delete ${banner.title}`}
              onClick={() =>
                setUi((current) => ({ ...current, deleting: banner }))
              }
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading banners…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Failed to load banners.
        </p>
      ) : null}

      {!isPending && !isError && banners.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No banners yet.
        </p>
      ) : null}

      {!isPending && !isError ? (
        <ListPagination
          className="border-t border-border px-4 py-3"
          page={ui.page}
          size={PAGE_SIZE}
          totalPages={totalPages}
          totalElements={data?.totalElements ?? 0}
          onPageChange={(page) => setUi((current) => ({ ...current, page }))}
        />
      ) : null}

      <BannerFormDialog
        open={ui.formOpen}
        banner={ui.editing}
        saving={saving}
        onOpenChange={(open) => {
          setUi((current) => ({
            ...current,
            formOpen: open,
            editing: open ? current.editing : null,
          }))
        }}
        onSave={handleSave}
      />
      <DeleteCmsDialog
        open={ui.deleting !== null}
        title="Delete banner"
        description={
          ui.deleting
            ? `Are you sure you want to delete "${ui.deleting.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this banner?"
        }
        deleting={deleteBanner.isPending}
        onOpenChange={(open) => {
          if (!open && !deleteBanner.isPending) {
            setUi((current) => ({ ...current, deleting: null }))
          }
        }}
        onConfirm={() => {
          if (!ui.deleting) return
          deleteBanner.mutate(ui.deleting.id, {
            onSuccess: () =>
              setUi((current) => ({ ...current, deleting: null })),
          })
        }}
      />
    </Card>
  )
}
