import { useCallback } from 'react'

import useCosmos from '.'
import { isDeliverTxSuccess, StdFee } from '@cosmjs/stargate'
import { cosmos } from 'interchain-query'
import { toast } from 'sonner'

const txRaw = cosmos.tx.v1beta1.TxRaw

interface Msg {
  typeUrl: string
  value: any
}

interface TxOptions {
  fee?: StdFee | null
  onSuccess?: () => void
}

export default function useCosmosTx() {
  const { address, getSigningStargateClient, estimateFee } = useCosmos()

  const tx = useCallback(
    async (msgs: Msg[], options?: TxOptions) => {
      if (!address) throw Error('Wallet not connected')

      let signed: Parameters<typeof txRaw.encode>['0']
      let client: Awaited<ReturnType<typeof getSigningStargateClient>>

      try {
        let fee: StdFee
        if (options?.fee) {
          fee = options.fee
          client = await getSigningStargateClient()
        } else {
          const [_fee, _client] = await Promise.all([
            estimateFee(msgs),
            getSigningStargateClient(),
          ])
          fee = _fee
          client = _client
        }

        // simulate the transaction
        const simulated = await client.simulate(address, msgs, '')
        console.log('simulated', simulated)

        signed = await client.sign(address, msgs, fee, '')

        if (client && signed) {
          const res = await client.broadcastTx(
            Uint8Array.from(txRaw.encode(signed).finish()),
          )
          if (isDeliverTxSuccess(res)) {
            options?.onSuccess?.()
            toast.success('Transaction Successful')
          } else {
            throw Error(res?.rawLog)
          }
        }
      } catch (error: any) {
        throw Error(error)
      }
    },
    [address, estimateFee, getSigningStargateClient],
  )

  return { tx }
}

export function catchCosmosTxError(error: any) {
  if (!error?.message?.includes('reject')) {
    toast.error(error?.message || 'An unexpected error has occured')
  }
}
