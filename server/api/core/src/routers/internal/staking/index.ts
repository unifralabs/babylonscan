import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  FetchStakingDelegationsQueryZodType,
  getStakingDelegations,
} from '../../../utils/staking'
import { z } from 'zod'

import { addressZodType } from '@cosmoscan/shared/types'

export const stakingRouter = createTRPCRouter({
  fetchInfiniteStakingTransactions: publicProcedure
    .input(FetchStakingDelegationsQueryZodType)
    .query(async ({ ctx, input }) => {
      const { take, cursor, desc, filter } = input

      return await getStakingDelegations(ctx.db, {
        take,
        cursor,
        filter,
        desc,
      })
    }),
  fetchInfiniteStakingTransactionsByAddress: publicProcedure
    .input(
      FetchStakingDelegationsQueryZodType.extend({ address: addressZodType }),
    )
    .query(async ({ ctx, input }) => {
      const { address, take, cursor, filter, desc } = input

      return await getStakingDelegations(ctx.db, {
        address,
        take,
        cursor,
        filter,
        desc,
      })
    }),
  stakingTracking: publicProcedure
    .input(
      z.object({
        transactionType: z.enum(['staking', 'unbonding', 'withdrawal']),
        stakingTxHex: z.string(),
        stakingTerm: z.number().optional(),
        stakingParams: z.string().optional(),
        amount: z.number().optional(),
        period: z.number().optional(),
        finalityProviderBTCPk: z.string().optional(),
        address: z.string(),
        publicKeyNoCoord: z.string(),
        feeRate: z.number().optional(),
        handlingFee: z.number().optional(),
        memo: z.string().optional(),
        tpRef: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.btc_staking_infos.create({
          data: {
            transaction_type: input?.transactionType,
            staking_tx_hex: input?.stakingTxHex,
            staking_term: input?.stakingTerm ?? 0,
            amount: input?.amount ?? 0,
            period: input?.period ?? 0,
            fp_btc_pk: input?.finalityProviderBTCPk ?? '',
            address: input?.address,
            public_key_nocoord: input?.publicKeyNoCoord,
            fee_rate: input?.feeRate ?? 0,
            handling_fee: input?.handlingFee ?? 0,
            memo: input?.memo,
            tp_ref: input?.tpRef,
          },
        })
        return { msg: 'success' }
      } catch (error) {
        throw error
      }
    }),
})
