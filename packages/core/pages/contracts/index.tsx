import { type Metadata } from 'next'

import { getTranslations } from 'next-intl/server'

import ContractsListTable from '@cosmoscan/core/components/contracts/table'
import {
  ContractsListTypeDict,
  ContractsListTypeEnum,
} from '@cosmoscan/shared/types'
import { formatPageTitle } from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'

export interface ContractsListParams {
  searchParams: {
    type?: ContractsListTypeEnum
  }
}

export async function generateMetadata({
  searchParams,
}: ContractsListParams): Promise<Metadata> {
  const t = await getTranslations('Contract')
  const pageMetadataT = await getTranslations('PageMetadata.Contracts')
  return {
    title: formatPageTitle(
      pageMetadataT('title', {
        type: t(
          ContractsListTypeDict[searchParams.type || ContractsListTypeEnum.ALL],
        ),
      }),
    ),
  }
}

export default function ContractsList({ searchParams }: ContractsListParams) {
  return (
    <Card className="p-gap w-full">
      <ContractsListTable type={searchParams?.type} withTabs />
    </Card>
  )
}
