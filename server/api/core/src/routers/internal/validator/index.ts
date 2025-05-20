import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import { formatProposalMessageTypeFromMessages } from '../../../utils/proposal'
import {
  getTotalValidatorsVotingPowerAndBonded,
  getValidatorDetail,
  getValidators,
  getValidatorStatusCounts,
  getValidatorLatestBlockSignaturesFromPrecommits,
  getValidatorProposedBlocks,
  getValidatorProposedBlocksCount,
  getValidatorMetrics
} from '../../../utils/validator'
import { z } from 'zod'

import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
  addressZodType,
  internalZodType,
  paginationZodType,
  ValidatorsSortTypeEnum,
  ValidatorStatusEnum,
  VoteEnum,
  VoteStatusEnum,
} from '@cosmoscan/shared/types'
import { deduplicateArray } from '@cosmoscan/shared/utils'

export const validatorRouter = createTRPCRouter({
 
  fetchValidatorMetrics: publicProcedure.query(async ({ ctx }) => {
    return getValidatorMetrics(ctx.db)
  }),
  fetchTotalValidatorsVotingPowerAndBonded: publicProcedure.query(
    async ({ ctx }) => {
      return await getTotalValidatorsVotingPowerAndBonded(ctx.db)
    },
  ),
  fetchValidatorStatusCounts: publicProcedure.query(async ({ ctx }) => {
    return await getValidatorStatusCounts(ctx.db)
  }),
  fetchInfiniteValidators: publicProcedure
    .input(
      z.object({
        cursor: paginationZodType,
        sort: z
          .nativeEnum(ValidatorsSortTypeEnum)
          .optional()
          .default(ValidatorsSortTypeEnum.COMMISSION),
        desc: z.boolean().optional().default(true),
        includeTotalDelegations: z.boolean().optional().default(false),
        status: z.nativeEnum(ValidatorStatusEnum).optional(),
        jailed: z.boolean().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        sort,
        desc,
        includeTotalDelegations,
        status,
        jailed,
        search,
      } = input
      const { take, skip } = cursor

      return await getValidators(ctx.db, {
        take,
        skip,
        sort,
        desc,
        includeTotalDelegations,
        status,
        jailed,
        search,
      })
    }),
  fetchValidatorDetail: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      return await getValidatorDetail(ctx.db, input)
    }),
  fetchValidatorDelegators: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        cursor: paginationZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        address,
      } = input
      const { take, skip } = cursor
      const items = await ctx.db.validators_delegations.findMany({
        take: take + 1,
        skip,
        where: {
          validator: address,
        },
        orderBy: [{ amount: 'desc' }, { id: 'asc' }],
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        items.pop()
        nextCursor = { take, skip: skip + take }
      }

      const tokens = await ctx.db.coin_denoms.findMany({
        where: {
          denom: {
            in: deduplicateArray(items.map(({ denom }) => denom)),
          },
        },
      })

      return {
        items: items?.map(item => ({
          ...item,
          token: tokens.find(({ denom }) => denom === item.denom),
        })),
        nextCursor,
      }
    }),
  fetchValidatorVotes: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            height_tx_index: z.object({
              height: z.bigint(),
              tx_index: z.number(),
            }),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, take, cursor } = input

      const items = await ctx.db.proposal_votes.findMany({
        take: take + 1,
        cursor,
        where: {
          voter: address,
        },
        orderBy: [{ height: 'desc' }, { tx_index: 'desc' }],
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = {
          height_tx_index: {
            height: nextItem!.height,
            tx_index: nextItem!.tx_index,
          },
        }
      }

      const proposals = await ctx.db.proposals.findMany({
        where: {
          proposal_id: {
            in: items.map(({ proposal_id }) => proposal_id),
          },
        },
        select: {
          proposal_id: true,
          messages: true,
          message_types: true,
          status: true,
          title: true,
        },
      })

      return {
        items: items.map(item => {
          const proposal = proposals.find(
            ({ proposal_id }) => proposal_id === item.proposal_id,
          )

          // First try to use message_types from the proposal
          const messageType =
            proposal?.message_types && proposal.message_types.length > 0
              ? proposal.message_types[0]
              : formatProposalMessageTypeFromMessages(proposal?.messages as any)

          return {
            ...item,
            messages: proposal?.messages || [],
            message_type: messageType,
            title: proposal?.title || '',
            vote_status: proposal?.status as unknown as VoteStatusEnum,
            vote: (item.options as any)?.[0]?.option as VoteEnum,
          }
        }),
        nextCursor,
      }
    }),
  fetchValidatorPowerEvents: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            validator_tx_hash: z.object({
              validator: z.string(),
              tx_hash: z.string(),
            }),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, take, cursor } = input
      const items = await ctx.db.validator_power_events.findMany({
        take: take + 1,
        cursor,
        where: {
          validator: address,
        },
        orderBy: [{ height: 'desc' }, { tx_index: 'desc' }],
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = {
          validator_tx_hash: {
            validator: nextItem!.validator,
            tx_hash: nextItem!.tx_hash,
          },
        }
      }

      return {
        items: items.map(item => ({
          ...item,
          event_type:
            item.event_type?.charAt(0).toUpperCase() +
            item.event_type?.slice(1),
        })),
        nextCursor,
      }
    }),
  searchValidators: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const validators = await ctx.db.validators.findMany({
        where: {
          name: {
            contains: input,
            mode: 'insensitive',
          },
        },
        select: {
          operator_address: true,
          name: true,
        },
        take: 5,
      })

      return validators
    }),
  fetchValidatorLatestBlockSignatures: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        limit: z.number().optional().default(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, limit } = input
      return await getValidatorLatestBlockSignaturesFromPrecommits(ctx.db, address, limit)
    }),
  fetchValidatorProposedBlocks: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        cursor: paginationZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 } } = input
      return await getValidatorProposedBlocks(ctx.db, address, cursor)
    }),
  fetchValidatorProposedBlocksCount: publicProcedure
    .input(
      z.object({
        address: addressZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address } = input
      return await getValidatorProposedBlocksCount(ctx.db, address)
    }),
})
