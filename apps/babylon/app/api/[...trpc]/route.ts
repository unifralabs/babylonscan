import { createOpenApiFetchHandler } from 'trpc-to-openapi'

import { appRouter, createTRPCContext } from '@cosmoscan/core-api'

export const dynamic = 'force-dynamic'

const handler = (req: Request) => {
  return createOpenApiFetchHandler({
    endpoint: '/api',
    router: appRouter,
    createContext: () => createTRPCContext(req),
    req,
  })
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
}
