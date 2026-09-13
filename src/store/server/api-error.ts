import { isAxiosError } from "axios"

export function apiErrorMessage(err: unknown, fallback: string) {
  if (!isAxiosError(err)) {
    return fallback
  }

  const data = err.response?.data as
    | { detail?: unknown; message?: unknown; title?: unknown }
    | undefined
  const message = [data?.detail, data?.message, data?.title].find(
    (value): value is string =>
      typeof value === "string" && Boolean(value.trim())
  )
  if (message) {
    return message
  }

  return fallback
}
