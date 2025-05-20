import { useEffect } from 'react'

import { useToggle } from 'react-use'

export default function useIsClient() {
  const [isClient, toggleIsClient] = useToggle(false)

  useEffect(() => {
    toggleIsClient(true)
  }, [toggleIsClient])

  return isClient
}
