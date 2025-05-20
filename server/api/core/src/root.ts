import { internalRouter } from './routers/internal'
import { createTRPCRouter } from './trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/src/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  internal: internalRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
