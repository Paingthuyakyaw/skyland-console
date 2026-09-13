import { axios } from "@/api"
import type { ApiResponse, MenuNode } from "@/store/server/staff/typed"
import { useQuery } from "@tanstack/react-query"

const MENUS_KEY = ["menus"] as const

export const getMenuTree = async () => {
  const { data } = await axios.get<ApiResponse<MenuNode[]>>("menus/tree")
  return data.data ?? []
}

export const useMenuTree = (enabled = true) => {
  return useQuery({
    queryKey: [...MENUS_KEY, "tree"],
    queryFn: getMenuTree,
    enabled,
  })
}
