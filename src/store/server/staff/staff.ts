import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  PageResponse,
  StaffCreateRequest,
  StaffQueryParams,
  StaffResponse,
  StaffUpdateRequest,
} from "@/store/server/staff/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteStaffPayload = {
  id: string
}

export type UpdateStaffPayload = {
  id: string
  staff: StaffUpdateRequest
}

const STAFF_KEY = ["staff"] as const

function invalidateStaff() {
  void queryClient.invalidateQueries({ queryKey: STAFF_KEY })
}

export const getStaffList = async (params: StaffQueryParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<StaffResponse>>>(
    "staff",
    {
      params: {
        query: params.query || undefined,
        status: params.status,
        roleId: params.roleId,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "name",
        direction: params.direction ?? "asc",
      },
    }
  )
  return data.data
}

export const useStaffList = (params: StaffQueryParams = {}) => {
  return useQuery({
    queryKey: [...STAFF_KEY, params],
    queryFn: () => getStaffList(params),
  })
}

export const getStaff = async (id: string) => {
  const { data } = await axios.get<ApiResponse<StaffResponse>>(`staff/${id}`)
  return data.data
}

export const useStaff = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...STAFF_KEY, id],
    queryFn: () => getStaff(id),
    enabled: enabled && Boolean(id),
  })
}

export const createStaff = async (payload: StaffCreateRequest) => {
  const { data } = await axios.post<ApiResponse<StaffResponse>>(
    "staff",
    payload
  )
  return data
}

export function useCreateStaff() {
  return useMutation({
    mutationFn: createStaff,
    onSuccess: (response) => {
      toast.success(response.message || "Staff added")
      invalidateStaff()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to add staff"))
    },
  })
}

export const updateStaff = async ({ id, staff }: UpdateStaffPayload) => {
  const { data } = await axios.put<ApiResponse<StaffResponse>>(
    `staff/${id}`,
    staff
  )
  return data
}

export function useUpdateStaff() {
  return useMutation({
    mutationFn: updateStaff,
    onSuccess: (response) => {
      toast.success(response.message || "Staff updated")
      invalidateStaff()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update staff"))
    },
  })
}

export const deleteStaff = async ({ id }: DeleteStaffPayload) => {
  const { data } = await axios.delete<ApiResponse<StaffResponse | unknown>>(
    `staff/${id}`
  )
  return data
}

export function useDeleteStaff() {
  return useMutation({
    mutationFn: deleteStaff,
    onSuccess: (response) => {
      toast.success(
        (response && "message" in response && response.message) ||
          "Staff deleted"
      )
      invalidateStaff()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete staff"))
    },
  })
}
