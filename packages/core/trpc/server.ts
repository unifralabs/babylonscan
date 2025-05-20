import { cache } from 'react'

import { headers as getHeaders } from 'next/headers'

import { createCaller, createTRPCContext } from '@cosmoscan/core-api'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const headers = new Headers(getHeaders())
  headers.set('x-trpc-source', 'rsc')

  return createTRPCContext({
    headers,
  })
})

export const serverApi = createCaller(createContext)
