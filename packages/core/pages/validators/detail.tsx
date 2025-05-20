import { type Metadata } from 'next'
import Link from 'next/link'

import ExternalLinkRenderer from '../../components/external-link-renderer'
import ValidatorDelegatorsTable from '../../components/validator/delegators-table'
import LatestBlocksUptime from '../../components/validator/latest-blocks-uptime'
import PowerEventsTable from '../../components/validator/power-events-table'
import ValidatorProposedBlocksTable from '../../components/validator/proposed-blocks-table'
import ValidatorStatus from '../../components/validator/status'
import VotesTable from '../../components/validator/votes-table'
import { serverApi } from '../../trpc/server'
import { getTranslations } from 'next-intl/server'

import { ValidatorStatusEnum } from '@cosmoscan/shared/types'
import { formatPageTitle } from '@cosmoscan/shared/utils'
import { Badge } from '@cosmoscan/ui/badge'
import { Button } from '@cosmoscan/ui/button'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'
import {
  AmountPercentLabel,
  PercentLabel,
} from '@cosmoscan/ui/components/percent-label'
import { Separator } from '@cosmoscan/ui/separator'

export interface ValidatorDetailProps {
  params: {
    address: string
  }
}

export async function generateMetadata({
  params: { address },
}: ValidatorDetailProps): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.Validator')
  return { title: formatPageTitle(t('title', { address })) }
}

export default async function ValidatorDetail({
  params,
}: ValidatorDetailProps) {
  const t = await getTranslations('Validator')
  const commonT = await getTranslations('Common')
  const blockT = await getTranslations('Block')
  const address = params.address.toLowerCase()
  const [validatorDetail, totalVotingPowerAndBonded, proposedBlocksCount] = await Promise.all([
    serverApi.internal.validator.fetchValidatorDetail(address),
    serverApi.internal.validator.fetchTotalValidatorsVotingPowerAndBonded(),
    serverApi.internal.validator.fetchValidatorProposedBlocksCount({ address }),
  ])

  const items = [
    [
      {
        label: t('name'),
        value: validatorDetail?.name || '-',
      },
      {
        label: t('operatorAddress'),
        value: (
          <CopyWrapper copyText={validatorDetail?.operator_address}>
            {validatorDetail?.operator_address}
          </CopyWrapper>
        ),
      },
      {
        label: t('ownerAddress'),
        value: !!validatorDetail?.owner_address ? (
          <ExternalLinkRenderer
            type="address"
            content={validatorDetail?.owner_address}
            short={false}
            isCopyable
          />
        ) : (
          '-'
        ),
      },
      {
        label: t('website'),
        value: !!validatorDetail?.website ? (
          <Link
            className="link"
            href={validatorDetail?.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {validatorDetail?.website}
          </Link>
        ) : (
          '-'
        ),
      },
      {
        label: t('description'),
        value: validatorDetail?.memo || '-',
      },
    ],
    [
      {
        label: t('votingPower'),
        value: (
          <AmountPercentLabel
            amount={BigInt(Number(validatorDetail?.voting_power ?? 0))}
            percent={
              !!!totalVotingPowerAndBonded?.totalVotingPower
                ? 0
                : Number(validatorDetail?.voting_power ?? 0) /
                  totalVotingPowerAndBonded?.totalVotingPower
            }
            isChainNativeToken
          />
        ),
      },
      {
        label: t('selfBonded'),
        value: (
          <AmountPercentLabel
            amount={BigInt(Number(validatorDetail?.self_bonded ?? 0))}
            percent={
              !!!totalVotingPowerAndBonded?.totalBonded
                ? 0
                : Number(validatorDetail?.self_bonded ?? 0) /
                  totalVotingPowerAndBonded?.totalBonded
            }
            isChainNativeToken
          />
        ),
      },
      {
        label: t('commission'),
        value: (
          <PercentLabel percent={Number(validatorDetail?.commission ?? 0)} />
        ),
      },
      {
        label: t('maxRate'),
        value: (
          <PercentLabel percent={Number(validatorDetail?.max_rate ?? 0)} />
        ),
      },
      {
        label: t('maxChangeRate'),
        value: (
          <PercentLabel
            percent={Number(validatorDetail?.max_change_rate ?? 0)}
          />
        ),
      },
      {
        label: t('uptime'),
        value: (
          <PercentLabel percent={validatorDetail?.uptime?.uptime}>
            {t('blocksMissed', { num: validatorDetail?.uptime?.missedBlocks })}
          </PercentLabel>
        ),
      },
      {
        label: t('status'),
        value: (
          <ValidatorStatus
            status={validatorDetail?.status as ValidatorStatusEnum}
            jailed={validatorDetail?.jailed}
          />
        ),
      },
    ],
  ]

  return (
    <>
      <PageCardTitle className="flex items-center justify-between">
        <span>{commonT('overview')}</span>
        {/* <Link href={`/staking?validator=${validatorDetail?.operator_address}`}> */}
        {/* ! We use unifra validator address for now */}
        <Link
          href={`/staking?validator=bbnvaloper1eh467lg292zwmt85nsnp3q8ylrykneqt2r68ms`}
        >
          <Button variant="default" size="sm">
            {t('stake')}
          </Button>
        </Link>
      </PageCardTitle>
      <Card className="p-gap flex flex-col">
        {items.map((item, index) => (
          <div key={index}>
            {!!index && <Separator className="my-gap" />}
            <DetailItems key={index} items={item} />
          </div>
        ))}

        <Separator className="my-gap" />

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">{t('uptimeByLatestBlocks')}</h3>
          <LatestBlocksUptime
            address={address}
            limit={100}
            refreshInterval={10000}
          />
        </div>
      </Card>

      <Card className="mt-gap p-gap">
        <PageLinkTabs
          queryKey="tab"
          defaultValue="delegators"
          tabs={[
            {
              value: 'delegators',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{t('stakers')}</span>
                  <Badge className="dark:bg-[#49240D]">
                    {validatorDetail.delegatorsCount}
                  </Badge>
                </div>
              ),
              content: <ValidatorDelegatorsTable address={address} />,
            },
            {
              value: 'votes',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{t('votes')}</span>
                  <Badge className="dark:bg-[#49240D]">
                    {validatorDetail.voteCount}
                  </Badge>
                </div>
              ),
              content: (
                <VotesTable address={validatorDetail.owner_address || ''} />
              ),
            },
            {
              value: 'powerEvents',
              valueContent: t('powerEvents'),
              content: (
                <PowerEventsTable
                  address={address}
                  ownerAddress={validatorDetail.owner_address || ''}
                />
              ),
            },
            {
              value: 'proposedBlocks',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{blockT('proposedBlocks')}</span>
                  <Badge className="dark:bg-[#49240D]">
                    {proposedBlocksCount}
                  </Badge>
                </div>
              ),
              content: <ValidatorProposedBlocksTable address={address} />,
            },
          ]}
        />
      </Card>
    </>
  )
}
