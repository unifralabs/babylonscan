'use client'

import { PropsWithChildren, useMemo } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { httpBatchLink, loggerLink, TRPCClientError } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'

import { type AppRouter } from '@cosmoscan/core-api'

const REACT_QUERY_RETRY_CONFG = {
  maxRetries: 3,
  skippedErrorCodes: [401, 402, 403, 404],
}

export const reactQueryRetry = (failureCount: number, error: unknown) => {
  if (
    error instanceof TRPCClientError &&
    REACT_QUERY_RETRY_CONFG.skippedErrorCodes.includes(
      error.shape?.data?.httpStatus ?? 0,
    )
  ) {
    return failureCount < 1
  }
  return failureCount < REACT_QUERY_RETRY_CONFG.maxRetries
}

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 10 * 1000,
        retry: reactQueryRetry,
      },
    },
  })

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: use singleton pattern to keep the same query client
    return (clientQueryClientSingleton ??= createQueryClient())
  }
}

export const clientApi = createTRPCReact<AppRouter>()

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

// Serialize a BigInt to JSON
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export function TRPCClientProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient()

  const trpcClient = useMemo(
    () =>
      clientApi.createClient({
        links: [
          loggerLink({
            enabled: op =>
              process.env.NODE_ENV === 'development' ||
              (op.direction === 'down' && op.result instanceof Error),
          }),
          // unstable_httpBatchStreamLink cannot return null
          httpBatchLink({
            transformer: superjson,
            url: getBaseUrl() + '/api/trpc',
            headers() {
              return {
                'x-trpc-source': 'nextjs-react',
              }
            },
          }),
        ],
      }),
    [],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <clientApi.Provider client={trpcClient} queryClient={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </clientApi.Provider>
    </QueryClientProvider>
  )
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.WEBSIT_URL) return process.env.WEBSIT_URL
  return `http://localhost:${process.env.PORT ?? 3000}`
}
