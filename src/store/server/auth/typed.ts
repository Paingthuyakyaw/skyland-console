export type TokenResponse = {
  accessToken: string
  refreshToken: string
  tokenType?: string
  expiresIn?: number
}

export type AuthApiResponse<T> = {
  success: boolean
  message?: string
  data: T
}
