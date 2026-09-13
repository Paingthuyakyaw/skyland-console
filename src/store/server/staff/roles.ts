import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  PageResponse,
  PermissionResponse,
  PermissionUpdateRequest,
  RoleResponse,
  RolesQueryParams,
} from "@/store/server/staff/typed"
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type UpdateRolePermissionsPayload = {
  id: string
  menuIds: string[]
}

const ROLES_KEY = ["roles"] as const

function extractMenuIds(payload: unknown, roleId: string): PermissionResponse {
  if (!payload || typeof payload !== "object") {
    return { roleId, menuIds: [] }
  }

  const record = payload as Record<string, unknown>
  if (Array.isArray(record.menuIds)) {
    return {
      roleId,
      menuIds: record.menuIds.filter(
        (value): value is string => typeof value === "string"
      ),
    }
  }

  if (record.permissions && typeof record.permissions === "object") {
    const nested = record.permissions as Record<string, unknown>
    if (Array.isArray(nested.menuIds)) {
      return {
        roleId,
        menuIds: nested.menuIds.filter(
          (value): value is string => typeof value === "string"
        ),
      }
    }
  }

  return { roleId, menuIds: [] }
}

export const getRoles = async (params: RolesQueryParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<RoleResponse>>>(
    "roles",
    {
      params: {
        query: params.query || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "name",
        direction: params.direction ?? "asc",
      },
    }
  )
  return data.data
}

export const useRoles = (params: RolesQueryParams = {}, enabled = true) => {
  return useQuery({
    queryKey: [...ROLES_KEY, params],
    queryFn: () => getRoles(params),
    enabled,
  })
}

export const getRolePermissions = async (id: string) => {
  try {
    const { data } = await axios.get<ApiResponse<unknown>>(
      `roles/${id}/permissions`
    )
    return extractMenuIds(data.data, id)
  } catch {
    const { data } = await axios.get<ApiResponse<unknown>>(`roles/${id}`)
    return extractMenuIds(data.data, id)
  }
}

export const useRolePermissions = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...ROLES_KEY, id, "permissions"],
    queryFn: () => getRolePermissions(id),
    enabled: enabled && Boolean(id),
  })
}

export const useRolesPermissions = (roleIds: string[]) => {
  return useQueries({
    queries: roleIds.map((id) => ({
      queryKey: [...ROLES_KEY, id, "permissions"],
      queryFn: () => getRolePermissions(id),
      enabled: Boolean(id),
    })),
  })
}

export const replaceRolePermissions = async ({
  id,
  menuIds,
}: UpdateRolePermissionsPayload) => {
  const body: PermissionUpdateRequest = { menuIds }
  const { data } = await axios.put<ApiResponse<PermissionResponse>>(
    `roles/${id}/permissions`,
    body
  )
  return data
}

export function useReplaceRolePermissions() {
  return useMutation({
    mutationFn: replaceRolePermissions,
    onSuccess: (_response, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: [...ROLES_KEY, id, "permissions"],
      })
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update permissions"))
    },
  })
}
