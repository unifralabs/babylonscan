import { appRouter } from './root'
import { createCallerFactory, createTRPCContext } from './trpc'

// /**
//  * Create a server-side caller for the tRPC API
//  * @example
//  * const trpc = createCaller(createContext);
//  * const res = await trpc.post.all();
//  *       ^? Post[]
//  */
const createCaller = createCallerFactory(appRouter)

export { createTRPCContext, appRouter, createCaller }

export * from './types'
