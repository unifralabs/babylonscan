import Link from 'next/link'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { FULL_ROUTES } from '@cosmoscan/shared/constants/routes'
import {
  cn,
  formatNumWithCommas,
  generatePath,
  shortStr,
} from '@cosmoscan/shared/utils'
import CopyIcon from '@cosmoscan/ui/components/copy-icon'
import { Tooltip } from '@cosmoscan/ui/tooltip'

export interface ExternalLinkRendererProps {
  classNames?: {
    root?: string
    link?: string
    copyIcon?: string
  }
  type:
    | 'block'
    | 'transactionsByBlock'
    | 'transaction'
    | 'finalityProvider'
    | 'btcFinalityProvider'
    | 'address'
    | 'validator'
    | 'token'
    | 'code'
    | 'contract'
  content: string | number | bigint
  pathParamValue?: string | number
  query?: Record<string, any>
  short?: boolean
  shortOptions?: { start?: number; end?: number }
  isCopyable?: boolean
  copyIconSize?: number
  showTooltip?: boolean
}

export function generateExternalLink({
  type,
  pathParamValue,
  query,
}: {
  type: ExternalLinkRendererProps['type']
  pathParamValue: string | number | bigint
  query?: Record<string, any>
}) {
  // Special handling for transaction links
  if (type === 'transaction') {
    return `${CURRENT_CHAIN.blockExplorer}/tx/${pathParamValue}`
  }

  return {
    block: generatePath(FULL_ROUTES.blockchain.blocks.detail, {
      params: {
        height: pathParamValue,
      },
      query,
    }),
    transactionsByBlock: generatePath(
      FULL_ROUTES.blockchain.transactions.index,
      {
        query,
      },
    ),
    transaction: generatePath(FULL_ROUTES.blockchain.transactions.detail, {
      params: {
        hash: pathParamValue,
      },
      query,
    }),
    finalityProvider: generatePath(
      FULL_ROUTES.staking.finalityProvider.detail,
      {
        params: {
          address: pathParamValue,
        },
        query,
      },
    ),
    btcFinalityProvider: generatePath(
      FULL_ROUTES.staking.btcFinalityProvider.detail,
      {
        params: {
          address: pathParamValue,
        },
        query,
      },
    ),
    address: generatePath(FULL_ROUTES.blockchain.addressDetail, {
      params: {
        address: pathParamValue,
      },
      query,
    }),
    validator: generatePath(FULL_ROUTES.blockchain.validators.detail, {
      params: {
        address: pathParamValue,
      },
      query,
    }),
    token: generatePath(FULL_ROUTES.token.detail, {
      params: {
        denom:
          type === 'token'
            ? encodeURIComponent(pathParamValue?.toString() || '')
            : pathParamValue,
      },
      query,
    }),
    code: generatePath(FULL_ROUTES.code.detail, {
      params: {
        code_id: pathParamValue,
      },
      query,
    }),
    contract: generatePath(FULL_ROUTES.contract.detail, {
      params: {
        address: pathParamValue,
      },
      query,
    }),
  }[type]
}

export default function ExternalLinkRenderer({
  classNames,
  type,
  content,
  pathParamValue,
  query,
  short,
  shortOptions,
  isCopyable = false,
  showTooltip = false,
  copyIconSize,
}: ExternalLinkRendererProps) {
  const isKeepAll = ['block', 'transactionsByBlock', 'code'].includes(type)
  const _pathParamValue = pathParamValue ?? content
  const _short = undefined === short ? undefined === pathParamValue : short

  const link = (
    <Link
      className={cn('link', classNames?.link)}
      href={generateExternalLink({
        type,
        pathParamValue: _pathParamValue,
        query,
      })}
      target={type === 'transaction' ? '_blank' : undefined}
      rel={type === 'transaction' ? 'noopener noreferrer' : undefined}
    >
      {isKeepAll
        ? formatNumWithCommas(content)
        : _short
          ? shortStr(content.toString(), shortOptions)
          : content?.toString()}
    </Link>
  )

  const _content = isKeepAll ? (
    link
  ) : _short || showTooltip ? (
    <Tooltip content={_pathParamValue.toString()}>{link}</Tooltip>
  ) : (
    link
  )

  return (
    <div
      className={cn(
        'break-all',
        isCopyable && 'flex-items-c gap-2',
        classNames?.root,
      )}
    >
      {_content}
      {isCopyable && (
        <CopyIcon
          className={classNames?.copyIcon}
          size={copyIconSize}
          text={_pathParamValue.toString()}
        />
      )}
    </div>
  )
}
