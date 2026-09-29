import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { ListPagination } from "@/components/list-pagination"
import { PagePlaceholder } from "@/components/page-placeholder"
import { Card } from "@/components/ui/card"
import { useBoundStore } from "@/store/client/use-store"
import {
  notificationDestination,
  notificationTitle,
  useAdminNotifications,
  useMarkNotificationRead,
} from "@/store/server/notifications/notifications"

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const [page, setPage] = useState(0)
  const token = useBoundStore((state) => state.token)
  const notifications = useAdminNotifications(Boolean(token), page, PAGE_SIZE)
  const markRead = useMarkNotificationRead()

  return (
    <div>
      <PagePlaceholder title="Notifications" subtitle="Important website, booking, and quote activity." />
      <Card className="gap-0 overflow-hidden py-0">
        {notifications.isPending && <p className="p-6 text-sm text-muted-foreground">Loading notifications…</p>}
        {notifications.isError && <p className="p-6 text-sm text-destructive">Unable to load notifications.</p>}
        {notifications.data?.content.length === 0 && <p className="p-6 text-sm text-muted-foreground">No notifications yet.</p>}
        {notifications.data?.content.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <span className={`h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-transparent" : "bg-primary"}`} />
            <a
              href={notificationDestination(item)}
              className="min-w-0 flex-1 hover:underline"
              onClick={(event) => {
                if (item.read) return
                event.preventDefault()
                void markRead.mutateAsync(item.id)
                  .catch(() => undefined)
                  .finally(() => window.location.assign(notificationDestination(item)))
              }}
            >
              <span className={item.read ? "text-sm" : "text-sm font-bold"}>{notificationTitle(item.eventType)}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </a>
            {!item.read && (
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
                disabled={markRead.isPending}
                onClick={() => markRead.mutate(item.id, { onError: () => toast.error("Unable to mark notification as read") })}
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
        {notifications.data && (
          <ListPagination
            className="px-4 py-3"
            page={page}
            size={PAGE_SIZE}
            totalPages={notifications.data.totalPages}
            totalElements={notifications.data.totalElements}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  )
}
