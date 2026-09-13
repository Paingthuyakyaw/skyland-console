import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  BannerRequest,
  BannerResponse,
  BlogRequest,
  BlogResponse,
  CmsListParams,
  CmsMediaAsset,
  FaqRequest,
  FaqResponse,
  PageResponse,
  UpdateRequest,
} from "@/store/server/cms/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

const BANNERS_KEY = ["cms", "banners"] as const
const BLOGS_KEY = ["cms", "blogs"] as const
const FAQS_KEY = ["cms", "faqs"] as const

function invalidateBanners() {
  void queryClient.invalidateQueries({ queryKey: BANNERS_KEY })
}

function invalidateBlogs() {
  void queryClient.invalidateQueries({ queryKey: BLOGS_KEY })
}

function invalidateFaqs() {
  void queryClient.invalidateQueries({ queryKey: FAQS_KEY })
}

function stripContentType(
  payload: unknown,
  headers?: { delete?: (name: string) => void }
) {
  headers?.delete?.("Content-Type")
  return payload
}

export const getBanners = async (params: CmsListParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<BannerResponse>>>(
    "cms/banners",
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return data.data
}

export const useBanners = (params: CmsListParams = {}) => {
  return useQuery({
    queryKey: [...BANNERS_KEY, params],
    queryFn: () => getBanners(params),
    placeholderData: keepPreviousData,
  })
}

export const createBanner = async (payload: BannerRequest) => {
  const { data } = await axios.post<ApiResponse<BannerResponse>>(
    "cms/banners",
    payload
  )
  return data
}

export function useCreateBanner() {
  return useMutation({
    mutationFn: createBanner,
    onSuccess: (response) => {
      toast.success(response.message || "Banner created")
      invalidateBanners()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create banner"))
    },
  })
}

export const updateBanner = async ({
  id,
  version,
  value,
}: {
  id: string
  version: number
  value: BannerRequest
  silent?: boolean
}) => {
  const body: UpdateRequest<BannerRequest> = { version, value }
  const { data } = await axios.put<ApiResponse<BannerResponse>>(
    `cms/banners/${id}`,
    body
  )
  return data
}

export function useUpdateBanner() {
  return useMutation({
    mutationFn: updateBanner,
    onSuccess: (response, variables) => {
      if (!variables.silent) {
        toast.success(response.message || "Banner updated")
      }
      invalidateBanners()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update banner"))
    },
  })
}

export const deleteBanner = async (id: string) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(`cms/banners/${id}`)
  return data
}

export function useDeleteBanner() {
  return useMutation({
    mutationFn: deleteBanner,
    onSuccess: (response) => {
      toast.success(response.message || "Banner deleted")
      invalidateBanners()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete banner"))
    },
  })
}

export const getBlogs = async (params: CmsListParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<BlogResponse>>>(
    "cms/blogs",
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return data.data
}

export const useBlogs = (params: CmsListParams = {}) => {
  return useQuery({
    queryKey: [...BLOGS_KEY, params],
    queryFn: () => getBlogs(params),
    placeholderData: keepPreviousData,
  })
}

export const getBlog = async (id: string) => {
  const { data } = await axios.get<ApiResponse<BlogResponse>>(`cms/blogs/${id}`)
  return data.data
}

export const useBlog = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...BLOGS_KEY, id],
    queryFn: () => getBlog(id),
    enabled: enabled && Boolean(id),
  })
}

export const createBlog = async (payload: BlogRequest) => {
  const { data } = await axios.post<ApiResponse<BlogResponse>>(
    "cms/blogs",
    payload
  )
  return data
}

export function useCreateBlog() {
  return useMutation({
    mutationFn: createBlog,
    onSuccess: (response) => {
      toast.success(response.message || "Post saved")
      invalidateBlogs()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save post"))
    },
  })
}

export const updateBlog = async ({
  id,
  version,
  value,
}: {
  id: string
  version: number
  value: BlogRequest
}) => {
  const body: UpdateRequest<BlogRequest> = { version, value }
  const { data } = await axios.put<ApiResponse<BlogResponse>>(
    `cms/blogs/${id}`,
    body
  )
  return data
}

export function useUpdateBlog() {
  return useMutation({
    mutationFn: updateBlog,
    onSuccess: (response) => {
      toast.success(response.message || "Post updated")
      invalidateBlogs()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update post"))
    },
  })
}

export const deleteBlog = async (id: string) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(`cms/blogs/${id}`)
  return data
}

export function useDeleteBlog() {
  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: (response) => {
      toast.success(response.message || "Post deleted")
      invalidateBlogs()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete post"))
    },
  })
}

export const getFaqs = async (params: CmsListParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<FaqResponse>>>(
    "cms/faqs",
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return data.data
}

export const useFaqs = (params: CmsListParams = {}) => {
  return useQuery({
    queryKey: [...FAQS_KEY, params],
    queryFn: () => getFaqs(params),
    placeholderData: keepPreviousData,
  })
}

export const createFaq = async (payload: FaqRequest) => {
  const { data } = await axios.post<ApiResponse<FaqResponse>>(
    "cms/faqs",
    payload
  )
  return data
}

export function useCreateFaq() {
  return useMutation({
    mutationFn: createFaq,
    onSuccess: (response) => {
      toast.success(response.message || "FAQ added")
      invalidateFaqs()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to add FAQ"))
    },
  })
}

export const updateFaq = async ({
  id,
  version,
  value,
}: {
  id: string
  version: number
  value: FaqRequest
}) => {
  const body: UpdateRequest<FaqRequest> = { version, value }
  const { data } = await axios.put<ApiResponse<FaqResponse>>(
    `cms/faqs/${id}`,
    body
  )
  return data
}

export function useUpdateFaq() {
  return useMutation({
    mutationFn: updateFaq,
    onSuccess: (response) => {
      toast.success(response.message || "FAQ updated")
      invalidateFaqs()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update FAQ"))
    },
  })
}

export const deleteFaq = async (id: string) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(`cms/faqs/${id}`)
  return data
}

export function useDeleteFaq() {
  return useMutation({
    mutationFn: deleteFaq,
    onSuccess: (response) => {
      toast.success(response.message || "FAQ deleted")
      invalidateFaqs()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete FAQ"))
    },
  })
}

export const uploadCmsImage = async (file: File, folderPath?: string) => {
  const formData = new FormData()
  formData.append("file", file)
  if (folderPath) formData.append("folderPath", folderPath)

  const { data } = await axios.post<ApiResponse<CmsMediaAsset>>(
    "cms/image-library",
    formData,
    { transformRequest: [stripContentType] }
  )
  return data
}

export function useUploadCmsImage() {
  return useMutation({
    mutationFn: ({ file, folderPath }: { file: File; folderPath?: string }) =>
      uploadCmsImage(file, folderPath),
    onSuccess: (response) => {
      toast.success(response.message || "Image uploaded")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to upload image"))
    },
  })
}
