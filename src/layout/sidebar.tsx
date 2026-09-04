import * as React from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Link, useLocation } from "@tanstack/react-router"

import logo from "@/assets/sky-land.png"
import { adminNavItems } from "@/lib/admin-nav-items"
import { cn } from "@/lib/utils"

function useNormalizedPath() {
  const { pathname } = useLocation()
  return React.useMemo(() => pathname.replace(/\/$/, "") || "/", [pathname])
}

type AppSidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
}

export function AppSidebar({
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: AppSidebarProps) {
  const activePath = useNormalizedPath()

  return (
    <aside
      className={cn(
        "z-40 flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[264px]",
        "fixed inset-y-0 left-0 lg:static",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "px-5"
        )}
      >
        <img
          src={logo}
          alt="Skyland Tourism"
          className={cn(
            "h-10 w-auto object-contain",
            collapsed && "max-w-10 object-left"
          )}
        />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <div className="px-2 pb-2 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
            Menu
          </div>
        )}
        {adminNavItems.map((item) => {
          const isActive =
            activePath === item.to || activePath.startsWith(`${item.to}/`)

          return (
            <Link
              key={item.to}
              to={item.to}
              preload={false}
              title={collapsed ? item.label : undefined}
              onClick={() => onMobileOpenChange(false)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm font-bold transition-all",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                  : "text-foreground/75 hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
                strokeWidth={2.1}
              />
              {!collapsed && (
                <span className="truncate text-left">{item.label}</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-control p-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-sm font-black text-secondary-foreground">
            DL
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[13px] font-bold text-foreground">
                  Diana Lopez
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Administrator
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCollapsedChange(true)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            className="mt-1 flex w-full items-center justify-center rounded-md py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
