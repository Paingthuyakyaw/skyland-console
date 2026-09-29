import { redirect } from "@tanstack/react-router"

/** Set to `true` to restore Combo Tours and Combo Tour Quotes. */
export const COMBO_TOURS_ENABLED = false

export function assertComboToursEnabled() {
  if (!COMBO_TOURS_ENABLED) {
    throw redirect({ to: "/tours" })
  }
}
