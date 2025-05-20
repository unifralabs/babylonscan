'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'

import { createDialogStore, DialogStore } from '../stores/dialog'
import { useStore } from 'zustand'

export type DialogStoreApi = ReturnType<typeof createDialogStore>

export const DialogStoreContext = createContext<DialogStoreApi | undefined>(
  undefined,
)

export interface DialogStoreProviderProps {
  children: ReactNode
}

export const DialogStoreProvider = ({ children }: DialogStoreProviderProps) => {
  const storeRef = useRef<DialogStoreApi>()
  if (!storeRef.current) {
    storeRef.current = createDialogStore()
  }

  return (
    <DialogStoreContext.Provider value={storeRef.current}>
      {children}
    </DialogStoreContext.Provider>
  )
}

export const useDialogStore = <T,>(selector: (store: DialogStore) => T): T => {
  const dialogStoreContext = useContext(DialogStoreContext)

  if (!dialogStoreContext) {
    throw new Error(`useDialogStore must be used within DialogStoreProvider`)
  }

  return useStore(dialogStoreContext, selector)
}
