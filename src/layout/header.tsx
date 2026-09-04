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

import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/use-logout"

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
] as const

const NOTIFICATIONS = [
  ["New booking SKY-24815", "Amelia Hartwell · Evening Desert Safari", "2m"],
  ["Payment received", "AED 1,720 from David Chen", "1h"],
  ["Booking cancelled", "SKY-24788 · refund issued", "3h"],
] as const

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
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const [langOpen, setLangOpen] = React.useState(false)
  const [lang, setLang] = React.useState<(typeof LANGUAGES)[number]>(
    LANGUAGES[0]
  )

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
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLang(item)
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
              setUserOpen(false)
              setLangOpen(false)
            }}
            className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-status-cancelled ring-2 ring-card" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-card border border-border bg-card p-2 shadow-xl">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-bold">Notifications</span>
                <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
                  3 new
                </span>
              </div>
              {NOTIFICATIONS.map(([title, subtitle, when], index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-lg px-2 py-2 hover:bg-muted"
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-foreground">
                      {title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {subtitle}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{when}</span>
                </div>
              ))}
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
