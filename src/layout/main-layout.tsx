import { useState } from "react"
import { Outlet } from "@tanstack/react-router"

import { AppHeader } from "./header"
import { AppSidebar } from "./sidebar"

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <AppSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
          onMobileOpen={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
