'use client'

import { useMemo, useState } from 'react'

import BtcFinalityProviderStakingTransactions, {
  BtcFpDetailChart,
  BtcFpDetailStatisticalData,
} from '../../components/btc-finality-providers/detail'
import { BtcFpTimeRangeOptions } from '../../components/btc-finality-providers/table'
import { clientApi } from '../../trpc/react'
import { useTranslations } from 'next-intl'

import { FinalityProviderAvatarNameWrapper } from '@cosmoscan/core/components/finality-provider'
import { Card } from '@cosmoscan/ui/card'
import { PageContainer } from '@cosmoscan/ui/layouts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@cosmoscan/ui/select'

export interface FinalityProviderParams {
  params: {
    address: string
  }
}

export default function FinalityProviderDetail({
  params,
}: FinalityProviderParams) {
  const t = useTranslations('Common')
  const btcPK = params.address.toUpperCase()
  const { data: finalityProviderDetail } =
    clientApi.internal.finalityProvider.fetchBtcFinalityProviderDetail.useQuery(
      btcPK,
    )

  const [timeFilter, setTimeFilter] = useState('all')

  const intervalDays = useMemo(
    () => ('all' !== timeFilter ? Number(timeFilter) : undefined),
    [timeFilter],
  )

  return (
    <PageContainer
      title={
        <div className="flex-bt-c flex-wrap gap-4">
          <FinalityProviderAvatarNameWrapper
            name={finalityProviderDetail?.name}
            address={btcPK}
            status={finalityProviderDetail?.status}
          />

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="bg-secondary max-w-32 rounded-lg">
              {!!BtcFpTimeRangeOptions?.find(
                ({ value }) => value === timeFilter,
              )?.label
                ? t(
                    BtcFpTimeRangeOptions?.find(
                      ({ value }) => value === timeFilter,
                    )?.label,
                  )
                : '-'}
            </SelectTrigger>
            <SelectContent>
              {BtcFpTimeRangeOptions?.map(({ label, value }) => (
                <SelectItem key={label} value={value}>
                  {t(label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      <BtcFpDetailStatisticalData address={btcPK} intervalDays={intervalDays} />

      <Card className="my-gap p-gap">
        <BtcFpDetailChart address={btcPK} intervalDays={intervalDays} />
      </Card>

      <Card className="p-gap w-full">
        <BtcFinalityProviderStakingTransactions
          address={btcPK}
          intervalDays={intervalDays}
          fpName={finalityProviderDetail?.name}
        />
      </Card>
    </PageContainer>
  )
}
