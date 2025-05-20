import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import EventLogs, { EventLog } from '../../components/transaction/event-logs'
import { serverApi } from '../../trpc/server'
import { getLocale, getTranslations } from 'next-intl/server'

import ExternalLinkRenderer, {
  type ExternalLinkRendererProps,
} from '@cosmoscan/core/components/external-link-renderer'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import {
  formatNumWithCommas,
  formatPageTitle,
  formatTimeAgo,
  formatUTCTime,
} from '@cosmoscan/shared/utils'
import { isValidBTCAddress } from '@cosmoscan/shared/utils/btc'
import { isValidAddress } from '@cosmoscan/shared/utils/chain'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import JsonViewer from '@cosmoscan/ui/components/json-viewer'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import DataTabs from '@cosmoscan/ui/components/underline-tabs'
import {
  GasIcon,
  TransactionsIcon,
  ValueIcon,
} from '@cosmoscan/ui/icons/statistical'

export interface TransactionDetailProps {
  params: {
    hash: string
  }
}

export async function generateMetadata({
  params: { hash },
}: TransactionDetailProps): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.Transaction')
  return {
    title: formatPageTitle(t('title', { hash })),
    description: t('description', {
      chain: process.env.COSMOSCAN_PUBLIC_CHAIN_TYPE_KEY,
      hash,
    }),
  }
}

export default async function TransactionDetail({
  params,
}: TransactionDetailProps) {
  const locale = await getLocale()
  const t = await getTranslations('Transaction')
  const commonT = await getTranslations('Common')
  const txHash = params.hash.toUpperCase()
  const txDetail =
    await serverApi.internal.transaction.fetchTransactionDetail(txHash)

  if (!txDetail) {
    notFound()
  }

  const statisticalItems = [
    {
      icon: ValueIcon,
      label: t('value'),
      value: (
        <AmountLabel
          amount={BigInt(Number(txDetail.amount ?? 0))}
          isChainNativeToken
        />
      ),
    },
    {
      icon: TransactionsIcon,
      label: t('transactionFee'),
      value: (
        <AmountLabel
          amount={BigInt(Number(txDetail.tx_fee ?? 0))}
          isChainNativeToken
        />
      ),
    },
    {
      icon: GasIcon,
      label: t('gas'),
      value: `${formatNumWithCommas(Number(txDetail.gas_used ?? 0))} / ${formatNumWithCommas(Number(txDetail.gas_wanted ?? 0))}`,
    },
  ]

  const detailItems = [
    {
      label: t('transactionHash'),
      value: (
        <CopyWrapper copyText={txDetail.hash}>{txDetail.hash}</CopyWrapper>
      ),
    },
    {
      label: t('block'),
      value: <ExternalLinkRenderer type="block" content={txDetail.height} />,
    },
  ]

  const detailInnerItems = [
    {
      label: t('status'),
      tooltip: t('statusTip'),
      value: 0 === txDetail.status ? commonT('success') : commonT('failed'),
    },
    {
      label: t('memo'),
      tooltip: t('memoTip'),
      value: txDetail.memo || '-',
    },
  ]

  // Messages tab content
  const MessagesTab = () => (
    <Card className="p-gap flex flex-col gap-16">
      {txDetail.message_types?.map((type, index) => (
        <div key={index}>
          <div className="flex-items-c mb-8 gap-2 text-lg">
            <span>{`#${index + 1}`}</span>
            <span>{type}</span>
          </div>

          <div className="flex flex-col gap-6">
            {Object.entries(txDetail.messages?.[index])?.map(
              ([keyText, valueText], cIndex) => (
                <div key={`${index}-${cIndex}`} className="flex gap-2">
                  <div className="text-foreground-secondary min-w-[170px]">
                    {keyText
                      ?.split('_')
                      ?.map(x => x.charAt(0).toUpperCase() + x.slice(1))
                      .join(' ')}
                  </div>
                  <div className="break-all">
                    <MessageValueRender
                      keyText={keyText}
                      valueText={valueText}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </Card>
  )

  // Event Logs tab content with parsed format
  const EventLogsTab = () => {
    const eventLogs: EventLog[] = (txDetail as any).event_logs || []
    return (
      <EventLogs
        eventLogs={eventLogs}
        noLogsMessage={t('noEventLogs', {
          defaultValue: 'No event logs available',
        })}
      />
    )
  }

  return (
    <>
      {0 !== Number(txDetail.status) && txDetail?.error_message && (
        <div className="text-red bg-red/10 mb-6 w-full rounded px-4 py-1">
          {JSON.stringify(txDetail?.error_message)}
        </div>
      )}

      <PageCardTitle>{commonT('overview')}</PageCardTitle>

      <StatisticalDataCards
        className="mb-gap gap-gap grid w-full grid-cols-1 lg:grid-cols-3"
        items={statisticalItems}
      />

      <Card className="p-gap">
        <div className="mb-6 flex flex-wrap gap-6">
          <span>
            {formatTimeAgo(txDetail.timestamp, locale)} (
            {formatUTCTime(txDetail.timestamp)})
          </span>
        </div>
        <DetailItems items={detailItems} />
        <div className="bg-secondary mt-gap p-gap rounded-lg">
          <DetailItems items={detailInnerItems} />
        </div>
      </Card>

      {!!txDetail.messages?.length && (
        <>
          <DataTabs
            variant="underlined"
            classNames={{
              root: 'mb-4 mt-gap',
              list: 'mb-4 flex gap-6 justify-start',
              trigger: 'font-medium',
              content: 'mt-4',
            }}
            tabs={[
              {
                value: 'messages',
                valueContent: t('messages'),
                content: <MessagesTab />,
              },
              {
                value: 'eventLogs',
                valueContent: t('eventLogs', { defaultValue: 'Event Logs' }),
                content: <EventLogsTab />,
              },
            ]}
          />
        </>
      )}
    </>
  )
}

function MessageValueRender({
  keyText,
  valueText,
}: {
  keyText: string
  valueText: string | object
}) {
  if (
    Array.isArray(valueText) &&
    valueText.every(
      item => typeof item === 'object' && 'denom' in item && 'amount' in item,
    )
  )
    return (
      <div>
        {valueText.map(({ denom, amount }, index) => (
          <div key={index}>
            <AmountLabel
              amount={BigInt(Number(amount ?? 0))}
              decimals={0}
              currency={denom}
            />
          </div>
        ))}
      </div>
    )

  // Unknown
  if (typeof valueText === 'object') {
    if (
      Object.prototype.toString.call(valueText) === '[object Object]' &&
      'denom' in valueText &&
      'amount' in valueText
    )
      return (
        <AmountLabel
          amount={BigInt(Number((valueText as any).amount ?? 0))}
          currency={(valueText as any).denom}
        />
      )

    return <JsonViewer src={valueText} collapsed={1} />
  }

  let type: ExternalLinkRendererProps['type'] | undefined = undefined

  if (
    ['block_height'].includes(keyText) &&
    !isNaN(Number(valueText)) &&
    Number(valueText) > 0
  ) {
    type = 'block'
  }

  const _valueText = valueText?.toString()
  if (isValidAddress(_valueText) || isValidBTCAddress(_valueText)) {
    type = 'address'
  }

  if (_valueText?.startsWith(`${CURRENT_CHAIN.addressPrexfix}valoper`)) {
    type = 'validator'
  }

  if ('fp_btc_pk' === keyText) {
    type = 'finalityProvider'
  }

  if (!!type)
    return (
      <ExternalLinkRenderer type={type} content={_valueText} short={false} />
    )

  return _valueText || ''
}
