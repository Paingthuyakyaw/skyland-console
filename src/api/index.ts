import { useBoundStore } from "@/store/client/use-store"
import Axios from "axios"
import { toast } from "sonner"

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuthRedirect?: boolean
  }
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
    const token = useBoundStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if ((status === 401 || status === 403) && !error.config?.skipAuthRedirect) {
      useBoundStore.getState().removeAuth()
      window.location.href = "/login"
      toast.error("You've been logout!")
    }
    return Promise.reject(error)
  }
)
