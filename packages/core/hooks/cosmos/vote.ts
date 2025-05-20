import { useCallback } from 'react'

import useCosmos from '.'
import useCosmosTx, { catchCosmosTxError } from './tx'
import { coins, StdFee } from '@cosmjs/stargate'
import { cosmos } from 'interchain-query'
import { type VoteOption } from 'interchain-query/cosmos/gov/v1/gov'
import { useToggle } from 'react-use'

export enum VoteTypeEnum {
  Yes = 1,
  No = 2,
  NoWithVeto = 3,
  Abstain = 4,
}

const MessageComposer = cosmos.gov.v1beta1.MessageComposer

export default function useCosmosVote() {
  const { address, isWalletConnected, connect, nativeToken } = useCosmos()
  const { tx } = useCosmosTx()

  const [isVoting, toggleVoting] = useToggle(false)

  const onVote = useCallback(
    async ({
      proposalId,
      voteType,
      cb,
    }: {
      proposalId: bigint
      voteType: VoteOption
      cb?: () => void
    }) => {
      if (!isWalletConnected) {
        connect()
        return
      }

      const msg = MessageComposer.fromPartial.vote({
        option: voteType,
        voter: address!,
        proposalId,
      })

      const fee: StdFee = {
        amount: coins('1000', nativeToken.base),
        gas: '100000',
      }

      try {
        toggleVoting(true)
        await tx([msg], { fee })
        cb?.()
      } catch (error) {
        catchCosmosTxError(error)
      } finally {
        toggleVoting(false)
      }
    },
    [isWalletConnected, address, nativeToken.base, connect, toggleVoting, tx],
  )

  return { onVote, isVoting }
}
