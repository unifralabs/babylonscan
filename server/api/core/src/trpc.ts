import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import type { OpenApiMeta } from 'trpc-to-openapi'
import { ZodError } from 'zod'

import prisma from '@cosmoscan/core-db'



export type Context = {
  source: string
  db: typeof prisma
}

/**
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: {
  headers: Headers
}): Promise<Context> => {
  const source = opts.headers.get('x-trpc-source') ?? 'unknown'
  console.log('>>> tRPC Request from', source, new Date().toTimeString())

  return {
    source,
    db: prisma,
  }
}

export const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      const shapeData = { ...shape.data }
      if (process.env.NODE_ENV === 'production') {
        const { stack, ...rest } = shapeData
        return {
          ...shape,
          data: {
            ...rest,
            zodError:
              error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
                ? error.cause.flatten()
                : null,
          },
        }
      }
      return {
        ...shape,
        data: {
          ...shapeData,
          zodError:
            error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
              ? error.cause.flatten()
              : null,
        },
      }
    },
  })

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory

/**
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

export const TRPCMergeRouters = t.mergeRouters
export const TRPCMiddleware = t.middleware
