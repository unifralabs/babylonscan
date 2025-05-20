import type { AppRouter } from '../root'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>



// internal router helpers
export type InternalRouterInputs = RouterInputs['internal']
export type InternalRouterOutputs = RouterOutputs['internal']

