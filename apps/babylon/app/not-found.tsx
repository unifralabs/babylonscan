'use client'

import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <SearchX className="mb-8 h-24 w-24 text-gray-400" strokeWidth={1.5} />

      <h1 className="mb-4 text-4xl font-bold">NO RESULTS FOUND</h1>

      <p className="text-lg text-gray-600">
        The page you are looking for could not be found.
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
