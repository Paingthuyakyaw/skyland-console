/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"

import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster } from "sonner"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  return (
    <ThemeProvider defaultTheme="light">
      <Outlet />
      <Toaster position="top-right" />
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </ThemeProvider>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Page not found</h1>
          <p>The page you are looking for does not exist.</p>
        </div>
      </div>
    </div>
  )
}
