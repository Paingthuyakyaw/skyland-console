import { useBoundStore } from "@/store/client/use-store"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useCallback } from "react"

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useCallback(() => {
    useBoundStore.getState().removeAuth()
    queryClient.clear()
    void router.navigate({ to: "/login", search: { redirect: "/" } })
  }, [queryClient, router])
}
