import { authAxios } from "@/api/auth-client"
import { applySession } from "@/store/server/auth/refresh"
import type { AuthApiResponse, TokenResponse } from "@/store/server/auth/typed"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { toast } from "sonner"

export interface LoginPayload {
  email: string
  password: string
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
  const { data } = await authAxios.post<AuthApiResponse<TokenResponse>>(
    "auth/login",
    payload
  )
  return data
}

export function useLogin(redirect = "/") {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (response) => {
      const tokens = response.data
      if (!tokens?.accessToken || !tokens.refreshToken) {
        toast.error(
          response.message || "Login response did not include a session token."
        )
        return
      }

      applySession(tokens)
      toast.success(response.message || "Login Successful")
      void router.navigate({ href: redirect })
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err))
    },
  })
}
