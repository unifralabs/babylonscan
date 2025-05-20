'use client'

import { useParams } from 'next/navigation'

import { SearchX } from 'lucide-react'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'

export default function NotFound() {
  const params = useParams()
  const hash = params?.hash as string
  const truncatedHash = hash ? `${hash.slice(0, 7)}...${hash.slice(-7)}` : ''

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-8 h-24 w-24 text-gray-400" strokeWidth={1.5} />

      <h1 className="mb-4 text-4xl font-bold">NO RESULTS FOUND</h1>

      <p className="mb-2 text-lg text-gray-600">
        Transaction <span className="text-blue-500">{truncatedHash}</span> was
        not found on the{' '}
        <span className="font-medium">{CURRENT_CHAIN.chainId}</span> network!
      </p>
      <p className="text-gray-600">
        Please check that transaction was successful and try again later.
      </p>

      <p className="mt-8 text-gray-600">
        If you think it should not be happening, please{' '}
        <a
          href="mailto:support@unifra.io"
          className="text-blue-500 hover:underline"
        >
          contact us
        </a>
      </p>
    </div>
  )
}
