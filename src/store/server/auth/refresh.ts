import { authAxios } from "@/api/auth-client"
import { useBoundStore } from "@/store/client/use-store"
import type { AuthApiResponse, TokenResponse } from "@/store/server/auth/typed"

let refreshPromise: Promise<string> | null = null
let refreshTimer: number | null = null

const REFRESH_SKEW_MS = 60_000

function jwtExpiresAt(token: string) {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=")
    const parsed = JSON.parse(atob(padded)) as { exp?: number }
    return typeof parsed.exp === "number" ? parsed.exp * 1000 : null
  } catch {
    return null
  }
}

function clearRefreshTimer() {
  if (refreshTimer === null) return
  window.clearTimeout(refreshTimer)
  refreshTimer = null
}

export function scheduleAccessTokenRefresh(
  expiresIn?: number,
  accessToken?: string
) {
  clearRefreshTimer()

  const expiresAt =
    typeof expiresIn === "number"
      ? Date.now() + expiresIn * 1000
      : accessToken
        ? jwtExpiresAt(accessToken)
        : null

  if (!expiresAt) return

  const delay = Math.max(expiresAt - Date.now() - REFRESH_SKEW_MS, 0)
  refreshTimer = window.setTimeout(() => {
    void refreshAccessTokenOnce().catch(() => undefined)
  }, delay)
}

export function applySession(tokens: TokenResponse) {
  useBoundStore.getState().setAuth(tokens.accessToken, tokens.refreshToken)
  scheduleAccessTokenRefresh(tokens.expiresIn, tokens.accessToken)
}

async function refreshAccessToken() {
  const { refreshToken } = useBoundStore.getState()
  if (!refreshToken) {
    throw new Error("No refresh token")
  }

  const { data } = await authAxios.post<AuthApiResponse<TokenResponse>>(
    "auth/refresh",
    { refreshToken }
  )

  const accessToken = data.data?.accessToken
  if (!accessToken) {
    throw new Error("Refresh response did not include an access token")
  }

  applySession({
    accessToken,
    refreshToken: data.data.refreshToken || refreshToken,
    tokenType: data.data.tokenType,
    expiresIn: data.data.expiresIn,
  })
  return accessToken
}

export function refreshAccessTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

export function bootstrapAuthRefresh() {
  const { token, refreshToken } = useBoundStore.getState()
  if (!refreshToken) return

  const expiresAt = token ? jwtExpiresAt(token) : null
  if (!expiresAt || expiresAt - Date.now() <= REFRESH_SKEW_MS) {
    void refreshAccessTokenOnce().catch(() => undefined)
    return
  }

  scheduleAccessTokenRefresh(undefined, token)
}

export function clearAuthRefresh() {
  clearRefreshTimer()
}
