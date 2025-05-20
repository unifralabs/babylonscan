import { produce } from 'immer'
import { createStore } from 'zustand/vanilla'

export enum DialogIdsEnum {
  AddWatchingAddress = 'AddWatchingAddress',
  AddPrivateNameTagDialog = 'AddPrivateNameTagDialog',
  ProposalDetail = 'ProposalDetail',
}

export type DialogOpenState = Record<DialogIdsEnum, boolean>

const initialDialogOpenState = Object.keys(DialogIdsEnum).reduce(
  (obj, id) => ({
    ...obj,
    [id]: false,
  }),
  {} as DialogOpenState,
)

export type DialogProps = {
  props?: Record<any, any>
  onConfirm?: (data?: any) => void
}

export type DialogPropsState = Record<string, DialogProps>

const initialDialogPropsState = Object.keys(DialogIdsEnum).reduce(
  (obj, id) => ({
    ...obj,
    [id]: {},
  }),
  {} as DialogPropsState,
)

export type DialogState = {
  dialogOpenState: DialogOpenState
  dialogPropsState: DialogPropsState
}

export type DialogActions = {
  onOpenDialog: (id: DialogIdsEnum, dialogProps?: DialogProps) => void
  onCloseDialog: (id: DialogIdsEnum) => void
  onChangeDialog: (
    id: DialogIdsEnum,
    isOpen?: boolean,
    dialogProps?: DialogProps,
  ) => void
  onCloseAllDialog: () => void
}

export type DialogStore = DialogState & DialogActions

export const defaultInitState: DialogState = {
  dialogOpenState: initialDialogOpenState,
  dialogPropsState: initialDialogPropsState,
}

export const createDialogStore = (
  initState: DialogState = defaultInitState,
) => {
  return createStore<DialogStore>()((set, get) => ({
    ...initState,
    onOpenDialog: (id, dialogProps) =>
      set(state =>
        produce(state, draft => {
          draft.dialogOpenState[id] = true
          draft.dialogPropsState[id] = dialogProps || {}
        }),
      ),
    onCloseDialog: id =>
      set(state =>
        produce(state, draft => {
          draft.dialogOpenState[id] = false
          draft.dialogPropsState[id] = {}
        }),
      ),
    onChangeDialog: (id, isOpen, dialogProps) =>
      set(state =>
        produce(state, draft => {
          draft.dialogOpenState[id] =
            undefined === isOpen ? !state.dialogOpenState[id] : isOpen
          draft.dialogPropsState[id] = dialogProps || {}

          if (!draft.dialogOpenState[id]) {
            draft.dialogPropsState[id] = {}
          }
        }),
      ),
    onCloseAllDialog: () =>
      set({
        dialogOpenState: initialDialogOpenState,
        dialogPropsState: initialDialogPropsState,
      }),
  }))
}
