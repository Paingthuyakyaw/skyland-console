/* eslint-disable react-refresh/only-export-components */
import MainLayout from "@/layout/main-layout"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated")({
  // beforeLoad: ({ location }) => {
  //   if (useBoundStore.getState().token) {
  //     return
  //   }

  //   throw redirect({
  //     to: "/login",
  //     search: {
  //       redirect: `${location.pathname}${location.searchStr}`,
  //     },
  //   })
  // },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <MainLayout />
}
