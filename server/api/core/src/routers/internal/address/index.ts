import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  getAddressAssetStats,
  getAddressDelegatedBTCBalance,
  getAddressNativeBalance,
  getAddressTokensBalance,
} from '../../../utils/address'
import { z } from 'zod'

import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
  AddressPortfolioSortTypeEnum,
  addressZodType,
  cosmosAddressZodType,
  internalZodType,
  paginationZodType,
  StakingTransactionStakingStatusEnum,
} from '@cosmoscan/shared/types'

export const addressRouter = createTRPCRouter({
  fetchAddressMetaData: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.db.address_meta.findFirst({
        where: {
          OR: [
            { bbn_address: input },
            { btc_address: input },
            { bbn_pk: input },
            { btc_pk: input },
          ],
        },
      })
    }),
  fetchAddressPortfolio: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        cursor: paginationZodType,
        sort: z
          .nativeEnum(AddressPortfolioSortTypeEnum)
          .optional()
          .default(AddressPortfolioSortTypeEnum.BALANCE),
        desc: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        address,
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        sort,
        desc,
      } = input
      const { take, skip } = cursor

      return await getAddressTokensBalance(ctx.db, {
        address,
        take,
        skip,
        sort,
        desc,
      })
    }),
  fetchAddressNativeBalance: publicProcedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await getAddressNativeBalance(ctx.db, input.address)
    }),
  fetchAddressDelegatedBTCBalance: publicProcedure
    .input(
      z.object({
        btcAddress: z.string(),
        stakingStatus: z
          .array(z.nativeEnum(StakingTransactionStakingStatusEnum))
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await getAddressDelegatedBTCBalance(ctx.db, input)
    }),
  fetchAddressRewardsHistory: publicProcedure
    .input(
      z.object({
        address: cosmosAddressZodType,
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            height_tx_index_msg_index: z.object({
              height: z.bigint(),
              tx_index: z.number(),
              msg_index: z.number(),
            }),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, take, cursor } = input
      const items = await ctx.db.withdraw_history.findMany({
        take: take + 1,
        cursor,
        where: {
          delegator: address,
          withdrawal_type: 'withdraw_rewards',
        },
        orderBy: {
          timestamp: 'desc',
        },
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = {
          height_tx_index_msg_index: {
            height: nextItem!.height!,
            tx_index: nextItem!.tx_index!,
            msg_index: nextItem!.msg_index!,
          },
        }
      }

      return {
        items,
        nextCursor,
      }
    }),
  fetchAddressAssetStats: publicProcedure
    .input(
      z.object({
        address: cosmosAddressZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address } = input
      return await getAddressAssetStats(ctx.db, address)
    }),
})
