import type { StateCreator } from "zustand"

import { queryClient } from "@/lib/query-client"
import {
  DEFAULT_LOCALE,
  isLocaleCode,
  type LocaleCode,
} from "@/lib/locales"

const LOCALE_STORAGE_KEY = "locale"

export interface LocaleSlice {
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
}

function readStoredLocale(): LocaleCode {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored && isLocaleCode(stored)) {
    return stored
  }
  return DEFAULT_LOCALE
}

export const createLocaleSlice: StateCreator<LocaleSlice> = (set, get) => ({
  locale: readStoredLocale(),

  setLocale: (locale) => {
    if (get().locale === locale) return

    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    set({ locale })
    void queryClient.invalidateQueries()
  },
})
