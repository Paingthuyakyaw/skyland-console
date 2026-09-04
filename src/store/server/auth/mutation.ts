import { axios } from "@/api"
import { useBoundStore } from "@/store/client/use-store"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { isAxiosError } from "axios"
import { toast } from "sonner"

interface LoginPayload {
  username: string
  password: string
}

function tokenFromHeaders(headers: Record<string, unknown>) {
  const rawToken =
    headers["jwt-token"] ?? headers["Jwt-Token"] ?? headers["JWT-TOKEN"]
  if (typeof rawToken !== "string" || !rawToken.trim()) {
    return null
  }
  return rawToken
}

const login = (payload: LoginPayload) => axios.post("auth/login", payload)

export function useLogin(redirect = "/") {
  const { setAuth } = useBoundStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      const rawToken = tokenFromHeaders(data.headers ?? {})
      if (!rawToken) {
        toast.error("Login response did not include a session token.")
        return
      }

      setAuth(rawToken)
      toast.success("Login Successful")
      void router.navigate({ href: redirect })
    },
    onError: (err) => {
      const status = isAxiosError(err) ? err.response?.status : undefined
      toast.error(
        status === 400 ? "Username or Password incorrect" : "Login Failed"
      )
    },
  })
}
