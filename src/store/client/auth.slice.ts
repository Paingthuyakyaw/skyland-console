import type { StateCreator } from "zustand"

export interface AuthSlice {
  token: string
  refreshToken: string
  setAuth: (token: string, refreshToken?: string) => void
  removeAuth: () => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => {
  const token = localStorage.getItem("token") || ""
  const refreshToken = localStorage.getItem("refreshToken") || ""

  return {
    token,
    refreshToken,

    setAuth: (newToken: string, newRefreshToken = "") =>
      set(() => {
        localStorage.setItem("token", newToken)
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken)
        } else {
          localStorage.removeItem("refreshToken")
        }
        return { token: newToken, refreshToken: newRefreshToken }
      }),

    removeAuth: () =>
      set(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        return { token: "", refreshToken: "" }
      }),
  }
}
