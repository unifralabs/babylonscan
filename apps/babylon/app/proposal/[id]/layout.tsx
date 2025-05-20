import { PropsWithChildren } from 'react'

import { PageContainer } from '@cosmoscan/ui/layouts'

export default function ProposalDetailLayout({ children }: PropsWithChildren) {
  return <PageContainer title="Proposal">{children}</PageContainer>
}
