export const LOCALES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "sv", label: "Svenska", flag: "🇸🇪" },
  { code: "my", label: "မြန်မာ", flag: "🇲🇲" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
] as const

export type LocaleCode = (typeof LOCALES)[number]["code"]

export const DEFAULT_LOCALE: LocaleCode = "en"

export const LOCALE_CODES = LOCALES.map((locale) => locale.code)

export function isLocaleCode(value: string): value is LocaleCode {
  return (LOCALE_CODES as readonly string[]).includes(value)
}

export function getLocale(code: LocaleCode) {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES[0]
}
