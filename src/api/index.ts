import { useBoundStore } from "@/store/client/use-store"
import {
  clearAuthRefresh,
  refreshAccessTokenOnce,
} from "@/store/server/auth/refresh"
import Axios from "axios"
import { toast } from "sonner"

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean
    skipAuthHeader?: boolean
    _retry?: boolean
  }
}

function isPublicAuthUrl(url?: string) {
  if (!url) return false
  return (
    url.includes("auth/refresh") ||
    url.includes("auth/login") ||
    url.includes("auth/logout")
  )
}

export const axios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

axios.interceptors.request.use(
  (config) => {
    const { token, locale } = useBoundStore.getState()
    const skipAuthHeader = config.skipAuthHeader || isPublicAuthUrl(config.url)
    if (token && !skipAuthHeader) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      config.headers.delete?.("Authorization")
    }
    config.headers["Accept-Language"] = locale
    return config
  },
  (error) => Promise.reject(error)
)

function redirectToLogin() {
  clearAuthRefresh()
  useBoundStore.getState().removeAuth()
  window.location.href = "/login"
  toast.error("You've been logout!")
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const original = error.config

    if (
      (status === 401 || status === 403) &&
      original &&
      !original.skipAuthRedirect &&
      !original._retry
    ) {
      const refreshToken = useBoundStore.getState().refreshToken
      if (refreshToken) {
        original._retry = true
        try {
          const accessToken = await refreshAccessTokenOnce()
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${accessToken}`
          original.skipAuthHeader = false
          return axios(original)
        } catch {
          if (status === 401) {
            redirectToLogin()
          }
          return Promise.reject(error)
        }
      }
    }

    if (status === 401 && !original?.skipAuthRedirect) {
      redirectToLogin()
    }
    return Promise.reject(error)
  }
)
