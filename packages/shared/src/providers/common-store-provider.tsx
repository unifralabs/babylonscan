'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'

import { createCommonStore, type CommonStore } from '../stores/common'
import { useStore } from 'zustand'

export type CommonStoreApi = ReturnType<typeof createCommonStore>

export const CommonStoreContext = createContext<CommonStoreApi | undefined>(
  undefined,
)

export interface CommonStoreProviderProps {
  children: ReactNode
}

export const CommonStoreProvider = ({ children }: CommonStoreProviderProps) => {
  const storeRef = useRef<CommonStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createCommonStore()
  }

  return (
    <CommonStoreContext.Provider value={storeRef.current}>
      {children}
    </CommonStoreContext.Provider>
  )
}

export const useCommonStore = <T,>(selector: (store: CommonStore) => T): T => {
  const commonStoreContext = useContext(CommonStoreContext)

  if (!commonStoreContext) {
    throw new Error('useCommonStore must be used within CommonStoreProvider')
  }

  return useStore(commonStoreContext, selector)
}
