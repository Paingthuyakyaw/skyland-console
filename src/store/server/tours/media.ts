import { axios } from "@/api"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  MediaAssetResponse,
} from "@/store/server/tours/typed"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const uploadMediaAsset = async (file: File, folderPath = "tours") => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folderPath", folderPath)

  const { data } = await axios.post<ApiResponse<MediaAssetResponse>>(
    "media-assets",
    formData,
    {
      transformRequest: [
        (payload, headers) => {
          if (headers && typeof headers.delete === "function") {
            headers.delete("Content-Type")
          }
          return payload
        },
      ],
    }
  )
  return data
}

export function useUploadMediaAsset() {
  return useMutation({
    mutationFn: ({
      file,
      folderPath,
    }: {
      file: File
      folderPath?: string
    }) => uploadMediaAsset(file, folderPath),
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to upload image"))
    },
  })
}
