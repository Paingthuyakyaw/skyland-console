import { create } from "zustand"
import { createAuthSlice, type AuthSlice } from "./auth.slice"
import { createLocaleSlice, type LocaleSlice } from "./locale.slice"

export type BoundStore = AuthSlice & LocaleSlice

export const useBoundStore = create<BoundStore>()((...a) => ({
  ...createAuthSlice(...a),
  ...createLocaleSlice(...a),
}))
