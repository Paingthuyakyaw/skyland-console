import { useBoundStore } from "@/store/client/use-store"
import Axios from "axios"

export const authAxios = Axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

authAxios.interceptors.request.use((config) => {
  const { locale } = useBoundStore.getState()
  config.headers["Accept-Language"] = locale
  config.headers.delete?.("Authorization")
  return config
})
