import { useCallback, useEffect } from 'react'

import { useDialogStore } from '../../providers/dialog'
import { DialogIdsEnum, DialogProps } from '../../stores/dialog'

export default function useDialog(id: DialogIdsEnum) {
  const isOpen = useDialogStore(state => state.dialogOpenState)[id]
  const props = useDialogStore(state => state.dialogPropsState)[id]?.props || {}
  const onDialogConfirm = useDialogStore(state => state.dialogPropsState)[id]
    ?.onConfirm

  const onOpenDialog = useDialogStore(state => state.onOpenDialog)
  const onCloseDialog = useDialogStore(state => state.onCloseDialog)
  const onChangeDialog = useDialogStore(state => state.onChangeDialog)
  const onCloseAll = useDialogStore(state => state.onCloseAllDialog)

  const onOpen = useCallback(
    (dialogProps?: DialogProps) => onOpenDialog(id, dialogProps),
    [id, onOpenDialog],
  )
  const onClose = useCallback(() => onCloseDialog(id), [id, onCloseDialog])
  const onChange = useCallback(
    (isOpen?: boolean, dialogProps?: DialogProps) =>
      onChangeDialog(id, isOpen, dialogProps),
    [id, onChangeDialog],
  )

  useEffect(() => onCloseAll, [onCloseAll])

  return {
    isOpen,
    props,
    onDialogConfirm,
    onOpen,
    onClose,
    onChange,
    onCloseAll,
  }
}

export function useAddWatchingAddressDialog() {
  return useDialog(DialogIdsEnum.AddWatchingAddress)
}

export function useAddPrivateNameTagDialog() {
  return useDialog(DialogIdsEnum.AddPrivateNameTagDialog)
}

export function useProposalDetailDialog() {
  return useDialog(DialogIdsEnum.ProposalDetail)
}
