import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  getContractDetail,
  getContractExecutionCount,
  getContractHistory,
  searchContractsByLabel
} from '../../../utils/contract'
import { z } from 'zod'

import {
  addressZodType, ContractsListTypeEnum,
  internalZodType
} from '@cosmoscan/shared/types'

export const contractRouter = createTRPCRouter({
  fetchContractDetail: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      return await getContractDetail(ctx.db, input)
    }),
  fetchContractHistory: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      return await getContractHistory(ctx.db, input)
    }),
  fetchContractExecutionCount: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      return await getContractExecutionCount(ctx.db, input)
    }),
  fetchContractsByLabel: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return await searchContractsByLabel(ctx.db, input)
    }),
  fetchInfiniteContracts: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(ContractsListTypeEnum).optional(),
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            height: z.bigint(),
            tx_index: z.number(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { type, take, cursor } = input

      let txnCursorStr = ''
      const desc = true
      if (cursor != null) {
        const { height, tx_index } = cursor
        if (typeof height === 'bigint' && typeof tx_index === 'number') {
          if (desc) {
            txnCursorStr = `AND ((contracts.creation_height = ${height.toString()} AND contracts.creation_tx_index < ${tx_index}) OR
                               (contracts.creation_height < ${height.toString()}))`
          } else {
            txnCursorStr = `AND ((contracts.creation_height = ${height.toString()} AND contracts.creation_tx_index > ${tx_index}) OR
                               (contracts.creation_height > ${height.toString()}))`
          }
        }
      }

      const txnOrderByStr = desc
        ? 'ORDER BY contracts.creation_height DESC, contracts.creation_tx_index DESC'
        : 'ORDER BY contracts.creation_height ASC, contracts.creation_tx_index ASC'

      const whereClause = `1 = 1`

      let sql = `
            SELECT contracts.*
            FROM contracts
            WHERE ${whereClause}
            ${txnCursorStr}
            ${txnOrderByStr}
            LIMIT ${take}
        `
      if (type === ContractsListTypeEnum.VERIFIED) {
        sql = `
            SELECT contracts.*
            FROM contracts
            LEFT JOIN contract_codes ON contracts.code_id = contract_codes.code_id
            WHERE ${whereClause}
            AND contract_codes.is_verified = true
            ${txnCursorStr}
            ${txnOrderByStr}
            LIMIT ${take}
        `
      }

      const items = (await ctx.db.$queryRawUnsafe(sql)) as any[]

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > 0 && items.length === take) {
        nextCursor = {
          height: BigInt(items[items.length - 1].creation_height),
          tx_index: items[items.length - 1].creation_tx_index,
        }
      }

      return {
        items,
        nextCursor,
      }
    }),
})
