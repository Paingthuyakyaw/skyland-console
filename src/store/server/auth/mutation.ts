import { axios } from "@/api"
import { useBoundStore } from "@/store/client/use-store"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { toast } from "sonner"

export interface LoginPayload {
  email: string
  password: string
}

interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn?: number
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

function apiErrorMessage(err: unknown) {
  if (!isAxiosError(err)) {
    return "Login Failed"
  }

  const data = err.response?.data as
    { detail?: unknown; message?: unknown; title?: unknown } | undefined
  const message = [data?.detail, data?.message, data?.title].find(
    (value): value is string =>
      typeof value === "string" && Boolean(value.trim())
  )
  if (message) {
    return message
  }

  const status = err.response?.status
  if (status === 400 || status === 401) {
    return "Email or password is incorrect"
  }

  return "Login Failed"
}

const login = async (payload: LoginPayload) => {
  const { data } = await axios.post<ApiResponse<TokenResponse>>(
    "auth/login",
    payload,
    { skipAuthRedirect: true }
  )
  return data
}

export function useLogin(redirect = "/") {
  const { setAuth } = useBoundStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (response) => {
      const accessToken = response.data?.accessToken
      if (!accessToken) {
        toast.error(
          response.message || "Login response did not include a session token."
        )
        return
      }

      setAuth(accessToken, response.data.refreshToken)
      toast.success(response.message || "Login Successful")
      void router.navigate({ href: redirect })
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err))
    },
  })
}
