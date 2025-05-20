import { publicProcedure } from '../../../procedure'
import { createTRPCRouter } from '../../../trpc'
import {
  getAverageBlockTime, getBtcTotalFinalityProvidersCount,
  getBtcTotalStakersCount,
  getBtcTotalStakeSats, getTotalDelegationsCount,
  getTotalFinalityProvidersCount,
  getTotalStakersCount,
  getTotalStakeSats,
  getTotalSupportedChainsCount,
  getTotalTransactionsCount,
  getTotalValidatorsCount,
  getTotalWalletAddressesCount
} from '../../../utils/stat'

export const statRouter = createTRPCRouter({
  fetchTotalStakeSats: publicProcedure.query(async ({ ctx }) => {
    return await getTotalStakeSats(ctx.db)
  }),
  fetchTotalStakersCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalStakersCount(ctx.db)
  }),
  fetchTotalFinalityProvidersCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalFinalityProvidersCount(ctx.db)
  }),
  fetchTotalDelegationsCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalDelegationsCount(ctx.db)
  }),
  fetchTotalSupportedChainsCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalSupportedChainsCount(ctx.db)
  }),
  fetchAverageBlockTime: publicProcedure.query(async ({ ctx }) => {
    return await getAverageBlockTime(ctx.db)
  }),
  fetchTotalTransactionsCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalTransactionsCount(ctx.db)
  }),
  fetchTotalValidatorsCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalValidatorsCount(ctx.db)
  }),
  fetchTotalWalletAddressesCount: publicProcedure.query(async ({ ctx }) => {
    return await getTotalWalletAddressesCount(ctx.db)
  }),
  fetchBtcTotalStakeSats: publicProcedure.query(async ({ ctx }) => {
    return await getBtcTotalStakeSats(ctx.db)
  }),
  fetchBtcTotalFinalityProvidersCount: publicProcedure.query(
    async ({ ctx }) => {
      return await getBtcTotalFinalityProvidersCount(ctx.db)
    },
  ),
  fetchBtcTotalStakersCount: publicProcedure.query(async ({ ctx }) => {
    return await getBtcTotalStakersCount(ctx.db)
  }),
})
