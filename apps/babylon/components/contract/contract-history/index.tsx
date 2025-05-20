'use client'

import { useCallback, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { formatUTCTime } from '@cosmoscan/shared/utils'
import { Button } from '@cosmoscan/ui/button'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import { Skeleton } from '@cosmoscan/ui/skeleton'

import { clientApi } from '@/trpc/react'

export interface CodeContractsTableProps {
  contract_address: string
}

function JsonFormatter({ json }: { json: any }) {
  const t = useTranslations('Contract')

  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpand = useCallback(() => setIsExpanded(pre => !pre), [])

  const formatJson = (obj: any): string => {
    return JSON.stringify(obj, null, isExpanded ? 2 : 0)
  }

  return (
    <div className="flex flex-col gap-2 font-mono text-sm">
      <pre
        className={`overflow-x-auto ${isExpanded ? 'whitespace-pre' : 'whitespace-nowrap'}`}
      >
        <code>{formatJson(json)}</code>
      </pre>
      <div className="w-fit">
        <Button className="p-0" variant="link" onClick={toggleExpand}>
          {t(isExpanded ? 'Collapse' : 'Expand')}
        </Button>
      </div>
    </div>
  )
}

// Safe JSON parse function that handles errors
const safeJsonParse = (jsonString?: string) => {
  if (!jsonString) return {}
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return {}
  }
}

export default function ContractHistory({
  contract_address,
}: CodeContractsTableProps) {
  const t = useTranslations('Contract')
  const commonT = useTranslations('Common')

  const { data, isFetching } =
    clientApi.internal.contract.fetchContractHistory.useQuery(contract_address)

  const Operation = {
    0: 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED',
    1: 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT',
    2: 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE',
    3: 'CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS',
  }

  const loadingItems = useMemo(
    () => [
      {
        label: t('codeId'),
        value: <Skeleton className="inline-block h-7 w-3/5 rounded-md" />,
      },
      {
        label: t('txHash'),
        value: <Skeleton className="inline-block h-7 w-3/5 rounded-md" />,
      },
      {
        label: t('height'),
        value: <Skeleton className="inline-block h-7 w-3/5 rounded-md" />,
      },
      {
        label: t('time'),
        value: <Skeleton className="inline-block h-7 w-3/5 rounded-md" />,
      },
      {
        label: t('message'),
        value: <Skeleton className="inline-block h-7 w-3/5 rounded-md" />,
      },
    ],
    [t],
  )

  const detailItems = useCallback(
    (item: any) => [
      {
        label: t('codeId'),
        value: <ExternalLinkRenderer type="code" content={item?.code_id} />,
      },
      {
        label: t('txHash'),
        value: item?.tx_hash ? (
          <ExternalLinkRenderer type="transaction" content={item?.tx_hash} />
        ) : (
          ''
        ),
      },
      {
        label: t('height'),
        value: <ExternalLinkRenderer type="block" content={item?.height} />,
      },
      {
        label: t('time'),
        value: formatUTCTime(item.timestamp),
      },
      {
        label: t('message'),
        value: <JsonFormatter json={safeJsonParse(item.raw_msg)} />,
      },
    ],
    [t],
  )

  return (
    <div className="p-gap bg-secondary mt-page-gap rounded-lg">
      {isFetching &&
        [...Array(1)].map((_, index) => (
          <div key={index}>
            <h3 className="text-xl font-bold">
              <Skeleton className="inline-block h-7 w-3/5 rounded-md" />
            </h3>
            <DetailItems key={index} items={loadingItems} />
          </div>
        ))}
      {data && data.length > 0
        ? data?.map((item: any, key: number) => (
            <div key={key}>
              <h3 className="my-4 px-2 font-bold">
                {Operation[item.operation as keyof typeof Operation]}
              </h3>
              <DetailItems key={key} items={detailItems(item)} />
            </div>
          ))
        : !isFetching && <div className="text-center">{commonT('noData')}</div>}
    </div>
  )
}
