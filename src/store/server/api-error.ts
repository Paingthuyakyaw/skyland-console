import { isAxiosError } from "axios"

type ValidationError = {
  field?: unknown
  message?: unknown
}

type ApiErrorBody = {
  code?: unknown
  detail?: unknown
  message?: unknown
  title?: unknown
  errors?: unknown
}

function fieldLabel(field: string) {
  return field
    .replace(/^(tour|request)\./, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\[(\d+)\]/g, (_, index: string) => ` ${Number(index) + 1}`)
    .split(".")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" › ")
}

function validationMessage(errors: unknown) {
  if (!Array.isArray(errors)) return undefined

  const messages = errors
    .filter(
      (error): error is ValidationError =>
        typeof error === "object" && error !== null
    )
    .map((error) => {
      const field =
        typeof error.field === "string" ? fieldLabel(error.field) : ""
      const message =
        error.message === "must not be null" ? "is required" : error.message
      if (typeof message !== "string" || !message.trim()) return ""
      return field ? `${field} ${message}` : message
    })
    .filter(Boolean)

  return messages.length > 0 ? messages.join(" • ") : undefined
}

export function apiErrorMessage(err: unknown, fallback: string) {
  if (!isAxiosError(err)) {
    return fallback
  }

  const data = err.response?.data as ApiErrorBody | undefined
  const validation = validationMessage(data?.errors)
  if (validation) return validation

  const message = [data?.detail, data?.message, data?.title].find(
    (value): value is string =>
      typeof value === "string" && Boolean(value.trim())
  )
  if (message) {
    return message
  }

  return fallback
}

export function apiErrorCode(err: unknown) {
  if (!isAxiosError(err)) return undefined

  const code = (err.response?.data as ApiErrorBody | undefined)?.code
  return typeof code === "string" && code.trim() ? code : undefined
}
