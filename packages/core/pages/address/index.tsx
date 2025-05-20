import { ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { AddressQrcodeViewer } from '@cosmoscan/ui/components/address-qrcode'
import BlockieAvatar from '@cosmoscan/ui/components/blockie-avatar'
import CopyIcon from '@cosmoscan/ui/components/copy-icon'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import { PageContainer } from '@cosmoscan/ui/layouts'

export function AddressActionWrapper({
  title,
  address,
}: {
  title?: ReactNode
  address: string
}) {
  return (
    <div className="flex-items-c gap-5 break-all text-sm md:text-lg">
      <span>{title || address}</span>
      <div className="flex-items-c text-foreground/40">
        <CopyIcon
          className="text-foreground/40"
          text={address}
          variant="button"
        />
        <AddressQrcodeViewer address={address} />
      </div>
    </div>
  )
}

export async function InvalidAddressContent({ address }: { address: string }) {
  const t = await getTranslations('Address')
  const commonT = await getTranslations('Common')

  return (
    <PageContainer
      title={
        <div className="flex-items-c gap-5">
          <span>{t('addressDetails')}</span>
        </div>
      }
    >
      <div className="flex-items-c mb-page-gap gap-4">
        <BlockieAvatar className="h-14 w-14" address={address} />
        <div className="text-red text-lg">{t('invalidAddress')}</div>
      </div>

      <PageCardTitle>{commonT('overview')}</PageCardTitle>
      <Card className="p-gap mb-gap">
        <DetailItems
          items={[
            {
              label: t('symbolBalance', {
                symbol: CURRENT_CHAIN.nativeToken.symbol,
              }),
              value: '-',
            },
          ]}
        />
      </Card>
    </PageContainer>
  )
}
