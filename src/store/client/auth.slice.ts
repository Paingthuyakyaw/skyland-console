import type { StateCreator } from "zustand"

export interface AuthSlice {
  token: string
  setAuth: (token: string) => void
  removeAuth: () => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => {
  const token = localStorage.getItem("token") || ""

  return {
    token,

    setAuth: (newToken: string) =>
      set(() => {
        localStorage.setItem("token", newToken)
        return { token: newToken }
      }),

    removeAuth: () =>
      set(() => {
        localStorage.removeItem("token")
        return { token: "" }
      }),
  }
}
