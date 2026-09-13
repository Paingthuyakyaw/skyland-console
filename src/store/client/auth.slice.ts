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

    setAuth: (newToken: string, newRefreshToken) =>
      set((state) => {
        const nextRefreshToken = newRefreshToken || state.refreshToken
        localStorage.setItem("token", newToken)
        if (nextRefreshToken) {
          localStorage.setItem("refreshToken", nextRefreshToken)
        }
        return { token: newToken, refreshToken: nextRefreshToken }
      }),

    removeAuth: () =>
      set(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        return { token: "", refreshToken: "" }
      }),
  }
}
