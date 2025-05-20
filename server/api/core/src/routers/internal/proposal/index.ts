import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import { getAddressNativeBalance } from '../../../utils/address'
import BigNumber from 'bignumber.js'
import { z } from 'zod'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import {
  internalZodType,
  VoteEnum,
  VoteStatusEnum,
} from '@cosmoscan/shared/types'
import { formatNumWithPercent } from '@cosmoscan/shared/utils'

export const proposalRouter = createTRPCRouter({
  fetchInfiniteProposals: publicProcedure
    .input(
      z.object({
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            proposal_id: z.bigint(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { take, cursor } = input

      const items = await ctx.db.proposals.findMany({
        take: take + 1,
        cursor,
        select: {
          proposal_id: true,
          messages: true,
          message_types: true,
          status: true,
          title: true,
          voting_end_time: true,
          expedited: true,
        },
        orderBy: { proposal_id: 'desc' },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = {
          proposal_id: nextItem!.proposal_id,
        }
      }

      return {
        items: items.map(item => ({
          ...item,
          message_type:
            item.message_types && item.message_types.length > 0
              ? item.message_types[0]
              : 'Text',
          message_types:
            item.message_types && item.message_types.length > 0
              ? item.message_types
              : ['Text'],
          vote_status: item?.status as unknown as VoteStatusEnum,
        })),
        nextCursor,
      }
    }),
  fetchProposalDetail: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [item, paramsData, totalBondedAmount] = await Promise.all([
        ctx.db.proposals.findUnique({
          where: {
            proposal_id: input,
          },
          omit: {
            failed_reason: true,
            inserted_at: true,
            updated_at: true,
          },
        }),
        ctx.db.module_params.findUnique({
          where: {
            module_name: 'gov',
          },
          select: {
            params: true,
          },
        }),
        getAddressNativeBalance(
          ctx.db,
          CURRENT_CHAIN.porposalTotalBondedValidatorAddress,
        ),
      ])

      // If proposal doesn't exist, return null
      if (!item) {
        return null
      }

      const voteCountResult = item?.tally_result as {
        yes_count?: string
        abstain_count?: string
        no_count?: string
        no_with_veto_count?: string
      }

      const totalVoteCountAmount =
        Object.values(voteCountResult || {}).reduce(
          (a = '0', b) => BigNumber(a.toString()).plus(b.toString()).toString(),
          '0',
        ) ?? '0'

      return {
        ...item,
        vote_status: item?.status as unknown as VoteStatusEnum,
        message_type:
          item?.message_types && item?.message_types.length > 0
            ? item.message_types[0]
            : 'Text',
        message_types:
          item?.message_types && item?.message_types.length > 0
            ? item.message_types
            : ['Text'],
        expedited: item?.expedited ?? false,
        turnout: !!!Number(totalBondedAmount ?? '0')
          ? '0.00%'
          : formatNumWithPercent(
              BigNumber(totalVoteCountAmount ?? '0')
                .div(totalBondedAmount)
                .toString(),
            ),
        quorum: formatNumWithPercent(
          Number((paramsData?.params as any)?.quorum ?? 0),
        ),
        yesCount: {
          amount: voteCountResult?.yes_count ?? '0',
          percent: !!!Number(totalVoteCountAmount ?? '0')
            ? '0.00%'
            : formatNumWithPercent(
                BigNumber((voteCountResult?.yes_count ?? '0').toString())
                  .div(totalVoteCountAmount)
                  .toString(),
              ),
        },
        noCount: {
          amount: voteCountResult?.no_count ?? '0',
          percent: !!!Number(totalVoteCountAmount ?? '0')
            ? '0.00%'
            : formatNumWithPercent(
                BigNumber((voteCountResult?.no_count ?? '0').toString())
                  .div(totalVoteCountAmount)
                  .toString(),
              ),
        },
        noWithVetoCount: {
          amount: voteCountResult?.no_with_veto_count ?? '0',
          percent: !!!Number(totalVoteCountAmount ?? '0')
            ? '0.00%'
            : formatNumWithPercent(
                BigNumber(
                  (voteCountResult?.no_with_veto_count ?? '0').toString(),
                )
                  .div(totalVoteCountAmount)
                  .toString(),
              ),
        },
        abstainCount: {
          amount: voteCountResult?.abstain_count ?? '0',
          percent: !!!Number(totalVoteCountAmount ?? '0')
            ? '0.00%'
            : formatNumWithPercent(
                BigNumber((voteCountResult?.abstain_count ?? '0').toString())
                  .div(totalVoteCountAmount)
                  .toString(),
              ),
        },
      }
    }),
  fetchProposalVotes: publicProcedure
    .input(
      z.object({
        proposalId: z.number(),
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            id: z.number(),
          })
          .optional(),
        voteType: z
          .enum(['ALL', 'YES', 'NO', 'VETO', 'ABSTAIN', 'DIDNOTVOTE'])
          .optional(),
        accountType: z.enum(['ALL', 'VALIDATORS', 'REGULAR']).optional(),
        searchQuery: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        proposalId,
        take,
        cursor,
        voteType = 'ALL',
        accountType = 'ALL',
        searchQuery,
      } = input

      // If querying validators who did not vote
      if (voteType === 'DIDNOTVOTE') {
        // For DIDNOTVOTE, we only have validators, so if accountType is REGULAR, return empty
        if (accountType === 'REGULAR') {
          return {
            items: [],
            nextCursor: undefined,
          }
        }

        // First, get all voters for this proposal
        const voters = await ctx.db.proposal_votes.findMany({
          where: {
            proposal_id: BigInt(proposalId),
          },
          select: {
            voter: true,
          },
        })

        const voterAddresses = voters.map(v => v.voter)

        // Get all validators with pagination
        const allValidators = await ctx.db.validators.findMany({
          select: {
            id: true,
            name: true,
            operator_address: true,
            owner_address: true,
          },
          // Apply search filter if provided
          ...(searchQuery && {
            where: {
              OR: [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                {
                  operator_address: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
                {
                  owner_address: { contains: searchQuery, mode: 'insensitive' },
                },
              ],
            },
          }),
        })

        // Filter out validators who have voted
        const nonVoters = allValidators.filter(
          validator =>
            !voterAddresses.includes(validator.operator_address) &&
            !voterAddresses.includes(validator.owner_address),
        )

        // Apply pagination manually to ensure consistent page sizes
        const startIndex = cursor
          ? nonVoters.findIndex(v => v.id === cursor.id) + 1
          : 0
        const paginatedItems = nonVoters.slice(
          startIndex,
          startIndex + take + 1,
        )

        let nextCursor: typeof cursor | undefined = undefined
        if (paginatedItems.length > take) {
          const nextItem = paginatedItems.pop()
          nextCursor = {
            id: nextItem!.id,
          }
        }

        return {
          items: paginatedItems.map(validator => ({
            id: validator.id,
            validator_name: validator.name,
            voter: validator.owner_address || validator.operator_address,
            operator_address: validator.operator_address,
            vote_option: VoteEnum.DIDNOTVOTE,
            timestamp: null,
            is_validator: true,
            vote_weight: '0',
          })),
          nextCursor,
        }
      }

      // Fix search functionality: first get all validator information regardless of search query
      const allValidators = await ctx.db.validators.findMany({
        select: {
          id: true,
          name: true,
          operator_address: true,
          owner_address: true,
        },
      })

      // Create a map from validator address to validator object for efficient lookup
      const validatorMap = new Map()
      allValidators.forEach(validator => {
        validatorMap.set(validator.operator_address, validator)
        validatorMap.set(validator.owner_address, validator)
      })

      // Get validator addresses list for account type filtering
      const validatorAddresses = allValidators.flatMap(v => [
        v.operator_address,
        v.owner_address,
      ])

      // Build basic query conditions
      const whereClause: any = {
        proposal_id: BigInt(proposalId),
      }

      // Add vote type filter
      if (voteType !== 'ALL') {
        const voteOptionMap = {
          YES: 1,
          NO: 3,
          VETO: 4,
          ABSTAIN: 2,
        }
        whereClause.vote_option =
          voteOptionMap[voteType as keyof typeof voteOptionMap]
      }

      // Add account type filter
      if (accountType === 'VALIDATORS') {
        whereClause.voter = {
          in: validatorAddresses,
        }
      } else if (accountType === 'REGULAR') {
        whereClause.voter = {
          notIn: validatorAddresses,
        }
      }

      // Special handling for search queries
      let searchedValidatorAddresses: string[] = []
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()

        // Search for validator names and addresses
        const matchedValidators = allValidators.filter(
          v =>
            v.name?.toLowerCase().includes(query) ||
            false ||
            v.operator_address.toLowerCase().includes(query) ||
            v.owner_address.toLowerCase().includes(query),
        )

        searchedValidatorAddresses = matchedValidators.flatMap(v => [
          v.operator_address,
          v.owner_address,
        ])

        // If searching for validators and account type is validators or all
        if (
          searchedValidatorAddresses.length > 0 &&
          accountType !== 'REGULAR'
        ) {
          // Update query conditions to only find matching validator addresses
          if (whereClause.voter && whereClause.voter.in) {
            // If already filtering by validators, take intersection
            whereClause.voter.in = whereClause.voter.in.filter((addr: string) =>
              searchedValidatorAddresses.includes(addr),
            )
          } else {
            // Otherwise set directly to matching validator addresses
            whereClause.voter = {
              in: searchedValidatorAddresses,
              ...(whereClause.voter || {}),
            }
          }
        }

        // If searching for regular addresses or no matching validators found
        if (
          (accountType !== 'VALIDATORS' ||
            searchedValidatorAddresses.length === 0) &&
          query.length > 2
        ) {
          // If already have address filter conditions
          if (whereClause.voter) {
            // Add contains condition while preserving existing conditions
            if (whereClause.voter.in) {
              whereClause.OR = [
                { voter: whereClause.voter },
                { voter: { contains: query } },
              ]
              delete whereClause.voter
            } else if (whereClause.voter.notIn) {
              whereClause.AND = [
                { voter: whereClause.voter },
                { voter: { contains: query } },
              ]
              delete whereClause.voter
            } else {
              // Simple case, just add contains condition
              whereClause.voter = {
                contains: query,
                ...(whereClause.voter || {}),
              }
            }
          } else {
            // No existing conditions, set contains directly
            whereClause.voter = {
              contains: query,
            }
          }
        }

        // If search results in no valid query conditions (e.g., searching for validators but account type is REGULAR)
        if (
          searchedValidatorAddresses.length > 0 &&
          accountType === 'REGULAR'
        ) {
          // In this case there will be no results, return empty early
          return {
            items: [],
            nextCursor: undefined,
          }
        }
      }

      // Execute query
      const items = await ctx.db.proposal_votes.findMany({
        take: take + 1,
        cursor,
        where: whereClause,
        orderBy: [{ height: 'desc' }, { tx_index: 'desc' }],
        omit: {
          inserted_at: true,
          updated_at: true,
        },
      })

      // Handle pagination
      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = {
          id: nextItem!.id,
        }
      }

      // Process results, add validator information
      const processedItems = items.map(item => {
        const validator = validatorMap.get(item.voter)
        const isValidator = !!validator

        return {
          ...item,
          validator_name: validator?.name || null,
          operator_address: isValidator
            ? validator?.operator_address || null
            : null,
          vote_option: item.vote_option as unknown as VoteEnum,
          is_validator: isValidator,
          vote_weight: item.vote_weight || '0',
        }
      })

      return {
        items: processedItems,
        nextCursor,
      }
    }),
  fetchProposalDeposits: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const deposits = await ctx.db.proposal_deposits.findMany({
        where: {
          proposal_id: BigInt(input),
        },
        orderBy: {
          inserted_at: 'desc',
        },
      })

      return deposits
    }),
})
