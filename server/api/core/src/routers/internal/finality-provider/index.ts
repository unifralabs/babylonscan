import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  BtcFinalityProviderDailyStatisticalChartData,
  BtcFinalityProviderStatisticalData,
  BtcFpStakingTransactionsItem,
  type BtcFinalityProvider,
} from '../../../types'
import {
  getFinalityProviderDetail,
  getFinalityProviders,
  getStakingTransactionsIntervalDays,
  getTotalFinalityProvidersVotingPowerAndBonded
} from '../../../utils/finality-provider'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { PrismaType } from '@cosmoscan/core-db'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
  addressZodType,
  FinalityProvidersSortTypeEnum,
  internalZodType,
  paginationZodType,
  StakingTransactionStakingStatusEnum,
} from '@cosmoscan/shared/types'
import { getBTCAddressFromPublicKey } from '@cosmoscan/shared/utils/btc'

export const finalityProviderRouter = createTRPCRouter({
  fetchTotalFinalityProvidersVotingPowerAndBonded: publicProcedure.query(
    async ({ ctx }) => {
      return await getTotalFinalityProvidersVotingPowerAndBonded(ctx.db)
    },
  ),
  fetchInfiniteFinalityProviders: publicProcedure
    .input(
      z.object({
        cursor: paginationZodType,
        sort: z
          .nativeEnum(FinalityProvidersSortTypeEnum)
          .optional()
          .default(FinalityProvidersSortTypeEnum.TOTAL_DELEGATIONS),
        desc: z.boolean().optional().default(true),
        status: z.enum(['Active', 'Standby', 'Jailed']).optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        sort,
        desc,
        status,
        search,
      } = input
      const { take, skip } = cursor

      // Build the where clause for filtering
      const where: any = {}

      // Add status filter if provided
      if (status) {
        where.status = status
      }

      // Add search filter if provided
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { babylon_address: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Get finality providers with filters
      return await getFinalityProviders(ctx.db, {
        take,
        skip,
        sort,
        desc,
        where,
      })
    }),
  fetchAllFinalityProviders: publicProcedure
    .input(
      z
        .object({
          sort: z
            .nativeEnum(FinalityProvidersSortTypeEnum)
            .optional()
            .default(FinalityProvidersSortTypeEnum.TOTAL_DELEGATIONS),
          desc: z.boolean().optional().default(true),
        })
        .optional()
        .default({
          sort: FinalityProvidersSortTypeEnum.TOTAL_DELEGATIONS,
          desc: true,
        }),
    )
    .query(async ({ ctx, input }) => {
      const { sort, desc } = input

      const data = await ctx.db.finality_providers.findMany({
        orderBy: [{ [sort]: desc ? 'desc' : 'asc' }, { id: 'asc' }],
        omit: {
          master_pub_rand: true,
          inserted_at: true,
          updated_at: true,
        },
      })

      return data
    }),
  fetchFinalityProviderDetail: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      return await getFinalityProviderDetail(ctx.db, input)
    }),
  fetchFinalityProviderStakersNum: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.finality_providers.findUnique({
        where: {
          btc_pk: input,
        },
        select: {
          stakers: true,
        },
      })

      return data?.stakers ?? 0
    }),
  fetchInfiniteFinalityProviderStakers: publicProcedure
    .input(
      z.object({
        cursor: paginationZodType,
        address: addressZodType,
        search: z.string().optional(),
        status: z.enum(['Active', 'Inactive']).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        address,
        search,
        status,
      } = input
      const { take, skip } = cursor
      const where: any = {
        fp_btc_pk_list: {
          has: address,
        }
      }

      // Add status filter if provided
      if (status) {
        where.active = status === 'Active' ? true : false
      }

      // Use Prisma's properly typed approach
      const items = await ctx.db.finality_providers_delegations.groupBy({
        by: ['btc_pk'],
        where,
        _sum: {
          total_sat: true,
        },
        orderBy: [
          {
            _sum: {
              total_sat: 'desc',
            },
          },
          { btc_pk: 'asc' },
        ],
        take: take + 1,
        skip,
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        items.pop()
        nextCursor = { take, skip: skip + take }
      }

      // If there are no items, return early with no cursor
      if (items.length === 0) {
        return {
          items: [],
          nextCursor: undefined
        }
      }

      const itemBtcPks = items.map(item => item.btc_pk)
      
      // Base query
      let combinedItemsQuery: any = {
        select: {
          btc_pk: true,
          btc_address: true,
          babylon_address: true,
          active: true,
        },
        where: {
          btc_pk: {
            in: itemBtcPks,
          },
        }
      }

      // Add search condition if provided
      if (search && search.trim() !== '') {
        combinedItemsQuery.where = {
          AND: [
            { btc_pk: { in: itemBtcPks } },
            {
              OR: [
                { btc_address: { contains: search, mode: 'insensitive' } },
                { babylon_address: { contains: search, mode: 'insensitive' } },
              ],
            },
          ],
        }
      }

      const combinedItems =
        await ctx.db.finality_providers_delegations.findMany(combinedItemsQuery)

      // If search filtered everything out, return no results and no cursor
      if (search && combinedItems.length === 0) {
        return {
          items: [],
          nextCursor: undefined
        }
      }

      // Filter items based on search results
      const filteredItems = search
        ? items.filter(({ btc_pk }) =>
            combinedItems.some(item => item.btc_pk === btc_pk),
          )
        : items

      return {
        items: filteredItems.map(({ btc_pk, _sum }) => {
          const combinedItem = combinedItems.find(
            ({ btc_pk: _btc_pk }) => _btc_pk === btc_pk,
          )
          return {
            btc_pk,
            totalAmount: BigInt(Number(_sum?.total_sat ?? 0)),
            ...combinedItem,
          }
        }),
        nextCursor
      }
    }),
  fetchInfiniteFinalityProviderDelegations: publicProcedure
    .input(
      z.object({
        cursor: paginationZodType,
        address: addressZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        address,
      } = input
      const { take, skip } = cursor
      const items = await ctx.db.finality_providers_delegations.groupBy({
        take: take + 1,
        skip,
        by: ['btc_pk', 'staking_timestamp'],
        where: {
          fp_btc_pk_list: {
            has: address,
          },
        },
        _sum: {
          total_sat: true,
        },
        orderBy: [
          { staking_timestamp: 'asc' },
          {
            _sum: {
              total_sat: 'desc',
            },
          },
          { btc_pk: 'asc' },
        ],
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        items.pop()
        nextCursor = { take, skip: skip + take }
      }

      const combinedItems =
        await ctx.db.finality_providers_delegations.findMany({
          select: {
            btc_pk: true,
            btc_address: true,
            babylon_address: true,
            staking_tx_hash: true,
            staking_timestamp: true,
            staking_block_height: true,
          },
          where: {
            btc_pk: {
              in: items?.map(({ btc_pk }) => btc_pk),
            },
          },
        })

      return {
        items: items?.map(({ btc_pk, _sum }) => {
          const combinedItem = combinedItems.find(
            ({ btc_pk: _btc_pk }) => _btc_pk === btc_pk,
          )
          return {
            btc_pk,
            totalAmount: BigInt(Number(_sum?.total_sat ?? 0)),
            ...combinedItem,
          }
        }),
        nextCursor,
      }
    }),
  fetchBtcInfiniteFinalityProviders: publicProcedure
    .input(
      z.object({
        cursor: paginationZodType,
        desc: z.boolean().optional().default(true),
        name: z.string().optional(),
        intervalDays: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        cursor = { take: CONSTANT.tableDefaultPageSize, skip: 0 },
        desc,
        name,
        intervalDays,
      } = input
      const { take, skip } = cursor
      if ((name?.length ?? 0) > 50) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Finality provider name too long',
        })
      }

      const _intervalDays = await getStakingTransactionsIntervalDays(ctx.db, {
        intervalDays,
      })

      const items = await ctx.db.$queryRawUnsafe<BtcFinalityProvider[]>(
        `
        WITH RECURSIVE dates AS (
          SELECT
            DATE_TRUNC( 'day', NOW( ) - INTERVAL '${_intervalDays} day' ) :: TIMESTAMP AS DATE UNION ALL
          SELECT DATE
            + INTERVAL '1 day' 
          FROM
            dates 
          WHERE
            DATE < DATE_TRUNC( 'day', NOW( ) ) 
          ),
          daily_stats AS (
          SELECT
            st.finality_providers AS btc_pk,
            EXTRACT ( EPOCH FROM DATE_TRUNC( 'day', TO_TIMESTAMP( st.TIMESTAMP ) ) ) :: BIGINT AS day_timestamp,
            SUM ( st.amount ) AS daily_amount,
            COUNT ( DISTINCT st.staker ) AS daily_stakers 
          FROM
            staking_transactions st 
          WHERE
            st.tx_type = 'staking' 
            AND st.TIMESTAMP >= EXTRACT ( EPOCH FROM DATE_TRUNC( 'day', NOW( ) - INTERVAL '${_intervalDays} day' ) ) :: BIGINT 
          GROUP BY
            st.finality_providers,
            DATE_TRUNC( 'day', TO_TIMESTAMP( st.TIMESTAMP ) ) 
          ),
          current_period AS (
          SELECT
            st.finality_providers AS btc_pk,
            COUNT ( DISTINCT st.staker ) AS current_stakers,
            SUM ( st.amount ) AS current_total_sat 
          FROM
            staking_transactions st 
          WHERE
            st.tx_type = 'staking' 
            AND st.TIMESTAMP >= EXTRACT ( EPOCH FROM NOW( ) - INTERVAL '${_intervalDays} day' ) :: BIGINT 
          GROUP BY
            st.finality_providers 
          ),
          last_period AS (
          SELECT
            st.finality_providers AS btc_pk,
            COUNT ( DISTINCT st.staker ) AS last_stakers,
            SUM ( st.amount ) AS last_total_sat 
          FROM
            staking_transactions st 
          WHERE
            st.tx_type = 'staking' 
            AND st.TIMESTAMP >= EXTRACT ( EPOCH FROM NOW( ) - INTERVAL '${_intervalDays * 2} day' ) :: BIGINT 
            AND st.TIMESTAMP < EXTRACT ( EPOCH FROM NOW( ) - INTERVAL '${_intervalDays} day' ) :: BIGINT 
          GROUP BY
            st.finality_providers 
          ) SELECT
          cm.btc_pk,
          COALESCE ( fp.name, 'unknown' ) AS name,
          COALESCE ( fp.status, 'unknown' ) AS status,
          COALESCE ( fp.commission, 0 ) AS commission,
          cm.current_stakers AS stakers,
          cm.current_total_sat AS total_sat,
          ( cm.current_stakers - COALESCE ( lm.last_stakers, 0 ) ) AS stakers_growth,
        CASE
            WHEN COALESCE ( lm.last_stakers, 0 ) = 0 THEN
            NULL ELSE ROUND(
              ( ( cm.current_stakers - COALESCE ( lm.last_stakers, 0 ) ) :: NUMERIC * 100 / NULLIF ( lm.last_stakers, 0 ) ) :: NUMERIC,
              2 
            ) 
          END AS stakers_growth_percentage,
          ( cm.current_total_sat - COALESCE ( lm.last_total_sat, 0 ) ) AS total_sat_growth,
        CASE
            WHEN COALESCE ( lm.last_total_sat, 0 ) = 0 THEN
            NULL ELSE ROUND(
              ( ( cm.current_total_sat - COALESCE ( lm.last_total_sat, 0 ) ) :: NUMERIC * 100 / NULLIF ( lm.last_total_sat, 0 ) ) :: NUMERIC,
              2 
            ) 
          END AS total_sat_growth_percentage,
          ARRAY_AGG (
            json_build_object (
              'timestamp',
              EXTRACT ( EPOCH FROM d.DATE ) :: BIGINT,
              'amount',
              COALESCE ( ds.daily_amount, 0 ),
              'stakers',
              COALESCE ( ds.daily_stakers, 0 ) 
            ) 
          ORDER BY
            d.DATE 
          ) AS daily_data 
        FROM
          current_period cm
          LEFT JOIN last_period lm ON cm.btc_pk = lm.btc_pk
          LEFT JOIN fp_meta fp ON cm.btc_pk = fp.btc_pk
          CROSS JOIN dates d
          LEFT JOIN daily_stats ds ON cm.btc_pk = ds.btc_pk 
          AND EXTRACT ( EPOCH FROM d.DATE ) :: BIGINT = ds.day_timestamp 
        ${!!name?.trim() ? `WHERE fp.name ILIKE '%${name}%'` : ''}
        GROUP BY
          cm.btc_pk,
          fp.name,
          fp.status,
          fp.commission,
          cm.current_stakers,
          cm.current_total_sat,
          lm.last_stakers,
          lm.last_total_sat 
        ORDER BY
          cm.current_total_sat ${desc ? 'DESC' : 'ASC'} OFFSET ${skip} 
          LIMIT ${take + 1};
`,
      )

      let nextCursor: { take: number; skip: number } | undefined = undefined
      if (items.length > take) {
        items.pop()
        nextCursor = { take, skip: skip + take }
      }

      return { items, nextCursor }
    }),
  fetchBtcFinalityProviderDetail: publicProcedure
    .input(addressZodType)
    .query(async ({ ctx, input }) => {
      return ctx.db.fp_meta.findUnique({
        where: { btc_pk: input.toLowerCase() },
      })
    }),
  fetchBtcFinalityProviderDetailStatisticalData: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        intervalDays: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, intervalDays } = input
      const _address = address.toLowerCase()
      const _intervalDays = await getStakingTransactionsIntervalDays(ctx.db, {
        intervalDays,
        address: _address,
      })

      return (
        await ctx.db.$queryRawUnsafe<[BtcFinalityProviderStatisticalData]>(
          `
          WITH current_stats AS (
            SELECT COUNT
              ( DISTINCT st.staker ) AS current_stakers,
              SUM ( st.amount ) AS current_total_sat 
            FROM
              staking_transactions st 
            WHERE
              st.finality_providers = '${_address}' 
              AND st.tx_type = 'staking' 
              AND st.TIMESTAMP >= EXTRACT ( EPOCH FROM NOW( ) - INTERVAL '${_intervalDays} day' ) :: BIGINT 
            ),
            last_stats AS (
            SELECT COUNT
              ( DISTINCT st.staker ) AS last_stakers,
              SUM ( st.amount ) AS last_total_sat 
            FROM
              staking_transactions st 
            WHERE
              st.finality_providers = '${_address}' 
              AND st.tx_type = 'staking' 
              AND st.TIMESTAMP >= EXTRACT ( EPOCH FROM NOW( ) - INTERVAL '${_intervalDays * 2} day' ) :: BIGINT 
              AND st.TIMESTAMP < EXTRACT ( EPOCH FROM NOW( ) - INTERVAL '${_intervalDays} day' ) :: BIGINT 
            ) SELECT
            cs.current_stakers AS stakers,
            cs.current_total_sat AS total_sat,
            COALESCE ( fp.commission, 0 ) AS commission,
          CASE
              WHEN COALESCE ( ls.last_stakers, 0 ) = 0 THEN
              NULL ELSE ROUND(
                ( ( cs.current_stakers - COALESCE ( ls.last_stakers, 0 ) ) :: NUMERIC * 100 / NULLIF ( ls.last_stakers, 0 ) ) :: NUMERIC,
                2 
              ) 
            END AS stakers_growth_percentage,
          CASE
              WHEN COALESCE ( ls.last_total_sat, 0 ) = 0 THEN
              NULL ELSE ROUND(
                ( ( cs.current_total_sat - COALESCE ( ls.last_total_sat, 0 ) ) :: NUMERIC * 100 / NULLIF ( ls.last_total_sat, 0 ) ) :: NUMERIC,
                2 
              ) 
            END AS total_sat_growth_percentage 
          FROM
            current_stats cs
            CROSS JOIN ( SELECT commission FROM fp_meta WHERE btc_pk = '${_address}' ) fp
            LEFT JOIN last_stats ls ON TRUE;
        `,
        )
      )?.[0]
    }),
  fetchBtcFinalityProviderDetailStatisticalChartData: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        intervalDays: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address, intervalDays } = input
      const _address = address.toLowerCase()
      const _intervalDays = await getStakingTransactionsIntervalDays(ctx.db, {
        intervalDays,
        address: _address,
      })

      return await ctx.db.$queryRawUnsafe<
        BtcFinalityProviderDailyStatisticalChartData[]
      >(
        `
        WITH RECURSIVE dates AS (
            SELECT DATE_TRUNC('day', NOW() - INTERVAL '${_intervalDays} day')::timestamp AS date
            UNION ALL
            SELECT date + INTERVAL '1 day'
            FROM dates 
            WHERE date < DATE_TRUNC('day', NOW())
        ),
        daily_stats AS (
            SELECT 
                EXTRACT(EPOCH FROM DATE_TRUNC('day', TO_TIMESTAMP(st.timestamp)))::bigint AS day_timestamp,
                SUM(st.amount) AS daily_amount,
                COUNT(DISTINCT st.staker) AS daily_stakers
            FROM 
                staking_transactions st
            WHERE 
                st.tx_type = 'staking'
                AND st.finality_providers = '${_address}'
                AND st.timestamp >= EXTRACT(EPOCH FROM DATE_TRUNC('day', NOW() - INTERVAL '${_intervalDays} day'))::bigint
            GROUP BY 
                DATE_TRUNC('day', TO_TIMESTAMP(st.timestamp))
        )
        SELECT 
            EXTRACT(EPOCH FROM d.date)::bigint as timestamp,
            COALESCE(ds.daily_amount, 0) as amount,
            COALESCE(ds.daily_stakers, 0) as stakers
        FROM 
            dates d
        LEFT JOIN 
            daily_stats ds ON EXTRACT(EPOCH FROM d.date)::bigint = ds.day_timestamp
        ORDER BY 
            d.date;
        `,
      )
    }),
  fetchInfiniteBtcFpStakingTransactions: publicProcedure
    .input(
      z.object({
        address: addressZodType,
        take: internalZodType.pagination.take,
        cursor: z
          .object({
            id: z.number(),
          })
          .optional(),
        filter: z
          .object({
            stakingStatus: z
              .array(z.nativeEnum(StakingTransactionStakingStatusEnum))
              .optional(),
          })
          .optional(),
        timeRange: z
          .object({
            startTime: z.number().optional(),
            endTime: z.number().optional(),
          })
          .optional(),
        desc: z.boolean().optional().default(true),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        address,
        take = CONSTANT.tableDefaultPageSize,
        cursor,
        filter,
        timeRange,
        desc,
      } = input

      const items = await ctx.db.$queryRawUnsafe<
        BtcFpStakingTransactionsItem[]
      >(`
        WITH staking_status AS (
          SELECT 
            st.hash,
            CASE 
                WHEN EXISTS (SELECT 1 FROM staking_transactions w WHERE w.staking_hash = st.hash AND w.tx_type = 'withdraw') THEN 'WITHDRAWN'
                WHEN EXISTS (SELECT 1 FROM staking_transactions u WHERE u.staking_hash = st.hash AND u.tx_type = 'unbonding') THEN 'UNBONDED'
                ELSE 'ACTIVE'
            END AS status_desc
          FROM staking_transactions st
          WHERE st.tx_type = 'staking'
        )
        SELECT 
          st.id AS id,
          ss.status_desc AS status_desc,
          st.hash AS staking_tx_hash,
          st.staker AS staker,
          st.amount AS total_sat,
          st.period AS staking_peroid,
          st.timestamp AS staking_timestamp
        FROM staking_transactions st
        LEFT JOIN staking_status ss ON st.hash = ss.hash
        WHERE st.finality_providers = '${address.toLowerCase()}'
        AND st.tx_type = 'staking'
        ${!!filter?.stakingStatus?.length ? `AND ss.status_desc IN (${filter?.stakingStatus.map(status => `'${status}'`).join(',')})` : ''}
        ${!!timeRange ? `AND st.timestamp >= ${timeRange?.startTime} AND st.timestamp <= ${timeRange?.endTime}` : ''}
        ${!!cursor?.id ? `AND st.id ${desc ? '<=' : '>='} ${cursor.id}` : ''}
        ORDER BY st.id ${desc ? 'desc' : 'asc'}, st.timestamp ${desc ? 'desc' : 'asc'}
        LIMIT ${take + 1}
        `)

      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > take) {
        const nextItem = items.pop()
        nextCursor = {
          id: nextItem!.id,
        }
      }

      return {
        items: items?.map(item => ({
          ...item,
          btc_address: !!item.staker
            ? getBTCAddressFromPublicKey(`03${item.staker}`)
            : '',
          staking_timestamp: BigInt(item.staking_timestamp) * 1000n,
        })),
        nextCursor,
      }
    }),
  searchByName: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const finalityProviders = await ctx.db.finality_providers.findMany({
        where: {
          name: {
            contains: input,
            mode: 'insensitive',
          },
        },
        select: {
          btc_pk: true,
          name: true,
        },
        take: 5,
      })

      return finalityProviders
    }),
  fetchFinalityProviderStakerCounts: publicProcedure
    .input(
      z.object({
        address: addressZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address } = input

      // Query to get counts of active and inactive stakers
      const data = await ctx.db.$queryRaw<
        Array<{
          status: string
          count: bigint
        }>
      >(PrismaType.sql`
        SELECT 
          CASE 
            WHEN active = true THEN 'Active'
            ELSE 'Inactive'
          END as status,
          COUNT(*) as count
        FROM finality_providers_delegations
        WHERE fp_btc_pk_list @> ARRAY[${address}]
        GROUP BY 
          CASE 
            WHEN active = true THEN 'Active'
            ELSE 'Inactive'
          END
        ORDER BY status
      `)

      return data.map(item => ({
        ...item,
        count: Number(item.count),
      }))
    }),
  fetchFinalityProviderStatusCounts: publicProcedure.query(async ({ ctx }) => {
    // Query to get counts of finality providers by status
    const data = await ctx.db.$queryRaw<
      Array<{
        status: string
        count: bigint
      }>
    >(PrismaType.sql`
        SELECT 
          status,
          COUNT(*) as count
        FROM finality_providers
        GROUP BY status
        ORDER BY status
      `)

    return data.map(item => ({
      ...item,
      count: Number(item.count),
    }))
  }),
  fetchFinalityProviderStakersStatusCounts: publicProcedure
    .input(
      z.object({
        address: addressZodType,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { address } = input
      
      // Query to get counts of stakers by status (Active/Inactive)
      const data = await ctx.db.$queryRaw<
        Array<{
          status: string
          count: bigint
        }>
      >(PrismaType.sql`
          SELECT 
            CASE WHEN active = true THEN 'Active' ELSE 'Inactive' END as status,
            COUNT(DISTINCT btc_pk) as count
          FROM finality_providers_delegations
          WHERE fp_btc_pk_list @> ARRAY[${address}]::text[]
          GROUP BY active
          ORDER BY status
        `)

      return data.map(item => ({
        ...item,
        count: Number(item.count),
      }))
    }),
})
