import * as React from "react"
import {
  Bell,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftOpen,
  Search,
  Settings,
  User,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { getLocale, LOCALES } from "@/lib/locales"
import { useLogout } from "@/hooks/use-logout"
import { useBoundStore } from "@/store/client/use-store"
import {
  notificationDestination,
  notificationTitle,
  useAdminNotifications,
  useMarkNotificationRead,
  useUnreadNotificationCount,
} from "@/store/server/notifications/notifications"

type AppHeaderProps = {
  collapsed: boolean
  onExpand: () => void
  onMobileOpen: () => void
}

export function AppHeader({
  collapsed,
  onExpand,
  onMobileOpen,
}: AppHeaderProps) {
  const logout = useLogout()
  const locale = useBoundStore((state) => state.locale)
  const token = useBoundStore((state) => state.token)
  const setLocale = useBoundStore((state) => state.setLocale)
  const lang = getLocale(locale)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)
  const notifications = useAdminNotifications(Boolean(token))
  const unreadCount = useUnreadNotificationCount(Boolean(token))
  const markRead = useMarkNotificationRead()

  return (
    <header className="z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <button
        type="button"
        className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
        onClick={onMobileOpen}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {collapsed && (
        <button
          type="button"
          className="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:inline-flex"
          onClick={onExpand}
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </button>
      )}

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search bookings, customers, products…"
          className="h-10 w-full rounded-control border border-transparent bg-muted pr-4 pl-9 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:ring-2 focus:ring-ring/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span className="hidden rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground sm:inline">
          AED
        </span>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setLangOpen((value) => !value)
              setNotifOpen(false)
              setUserOpen(false)
            }}
            className="flex items-center gap-1.5 rounded-control border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-muted"
          >
            <span>{lang.flag}</span>
            <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {langOpen && (
            <div className="absolute right-0 z-50 mt-2 w-44 rounded-card border border-border bg-card p-1.5 shadow-xl">
              <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                Interface language
              </div>
              {LOCALES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLocale(item.code)
                    setLangOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    lang.code === item.code
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span>{item.flag}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {lang.code === item.code && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((value) => !value)
              void notifications.refetch()
              void unreadCount.refetch()
              setUserOpen(false)
              setLangOpen(false)
            }}
            className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {(unreadCount.data ?? 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-status-cancelled ring-2 ring-card" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 rounded-card border border-border bg-card p-2 shadow-xl">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-bold">Notifications</span>
                {(unreadCount.data ?? 0) > 0 && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                    {unreadCount.data} unread
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.isPending && <p className="px-2 py-5 text-center text-xs text-muted-foreground">Loading notifications…</p>}
                {notifications.isError && <p className="px-2 py-5 text-center text-xs text-destructive">Unable to load notifications.</p>}
                {notifications.data?.content.length === 0 && <p className="px-2 py-5 text-center text-xs text-muted-foreground">No notifications yet.</p>}
                {notifications.data?.content.map((item) => (
                  <a
                    key={item.id}
                    href={notificationDestination(item)}
                    className="flex gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                    onClick={(event) => {
                      if (item.read) return
                      event.preventDefault()
                      void markRead.mutateAsync(item.id)
                        .catch(() => undefined)
                        .finally(() => window.location.assign(notificationDestination(item)))
                    }}
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.read ? "bg-transparent" : "bg-primary")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-[13px] text-foreground", !item.read && "font-bold")}>{notificationTitle(item.eventType)}</span>
                      <span className="block text-xs text-muted-foreground">Open details</span>
                    </span>
                    <time className="text-xs whitespace-nowrap text-muted-foreground" dateTime={item.createdAt}>
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </time>
                  </a>
                ))}
              </div>
              <Link
                to="/notifications"
                className="block border-t border-border px-2 py-2 text-center text-xs font-semibold text-primary hover:bg-muted"
                onClick={() => setNotifOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserOpen((value) => !value)
              setNotifOpen(false)
              setLangOpen(false)
            }}
            className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-muted"
            aria-label="Account menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft text-xs font-black text-secondary-foreground">
              DL
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-card border border-border bg-card p-1.5 shadow-xl">
              <div className="border-b border-border px-3 py-2">
                <div className="text-sm font-bold">Diana Lopez</div>
                <div className="text-xs text-muted-foreground">
                  diana@skyland.ae
                </div>
              </div>
              <button
                type="button"
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <User className="h-4 w-4 text-muted-foreground" /> Profile
              </button>
              <Link
                to="/settings"
                preload={false}
                onClick={() => setUserOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Settings className="h-4 w-4 text-muted-foreground" /> Settings
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-status-cancelled hover:bg-status-cancelled-bg"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
