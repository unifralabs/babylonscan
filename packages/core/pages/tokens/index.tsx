import { type Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import TokenTrackerTable from '@cosmoscan/core/components/tokens/table'
import {
  TokenTrackerTypeDict,
  TokenTrackerTypeEnum,
} from '@cosmoscan/shared/types'
import { formatPageTitle } from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'

export interface TokenTrackerParams {
  searchParams: {
    type?: TokenTrackerTypeEnum
  }
}

export async function generateMetadata({
  searchParams,
}: TokenTrackerParams): Promise<Metadata> {
  const t = await getTranslations('Token')
  const pageMetadataT = await getTranslations('PageMetadata.Tokens')
  return {
    title: formatPageTitle(
      pageMetadataT('title', {
        type: t(
          TokenTrackerTypeDict[
            searchParams.type || TokenTrackerTypeEnum.TRENDING
          ],
        ),
      }),
    ),
  }
}

export default function TokenTracker({ searchParams }: TokenTrackerParams) {
  return (
    <Card className="p-gap w-full">
      <TokenTrackerTable type={searchParams?.type} withTabs />
    </Card>
  )
}
