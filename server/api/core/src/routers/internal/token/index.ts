import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  getTokens,
  getTokensByDenoms,
  getTokenTopHolders,
  searchTokensByDenom,
} from '../../../utils/token'
import { z } from 'zod'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
  denomZodType,
  paginationZodType,
  TokenTopHoldersSortTypeEnum,
  TokenTrackerSortTypeEnum,
  TokenTrackerTypeEnum,
} from '@cosmoscan/shared/types'

export const tokenRouter = createTRPCRouter({
  fetchInfiniteTokens: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(TokenTrackerTypeEnum).optional(),
        cursor: paginationZodType,
        sort: z
          .nativeEnum(TokenTrackerSortTypeEnum)
          .optional()
          .default(TokenTrackerSortTypeEnum.CIRCULATING_MARKET_CAP),
        desc: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        type,
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        sort,
        desc,
      } = input
      const { take, skip } = cursor

      return await getTokens(ctx.db, { type, take, skip, sort, desc })
    }),
  fetchNativeTokenDetail: publicProcedure.query(async ({ ctx }) => {
    return (
      await getTokensByDenoms(ctx.db, [CURRENT_CHAIN.nativeToken.denom])
    )?.[0]
  }),
  fetchTokenDetailByDenom: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return (await getTokensByDenoms(ctx.db, [input]))?.[0]
    }),
  searchTokensByDenom: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await searchTokensByDenom(ctx.db, input)
    }),
  fetchTokenTopHolders: publicProcedure
    .input(
      z.object({
        denom: denomZodType,
        cursor: paginationZodType,
        sort: z
          .nativeEnum(TokenTopHoldersSortTypeEnum)
          .optional()
          .default(TokenTopHoldersSortTypeEnum.BALANCE),
        desc: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        denom,
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        sort,
        desc,
      } = input
      const { take, skip } = cursor

      return await getTokenTopHolders(ctx.db, {
        denom,
        take,
        skip,
        sort,
        desc,
      })
    }),
})
