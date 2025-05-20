import { createStore } from 'zustand/vanilla'

export type CommonState = {
  isMenuCollapsed: boolean
}

export type CommonActions = {
  toggleMenuCollapsed: (collapsed?: boolean) => void
}

export type CommonStore = CommonState & CommonActions

export const defaultInitState: CommonState = {
  isMenuCollapsed: false,
}

export const createCommonStore = () => {
  return createStore<CommonStore>()((set, get) => ({
    ...defaultInitState,
    toggleMenuCollapsed: collapsed =>
      set({
        isMenuCollapsed:
          undefined === collapsed ? !get().isMenuCollapsed : collapsed,
      }),
  }))
}
