'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  TransactionTypesCell,
  VoteStatusCell,
} from '../components/table-cell-renderer'
import { useProposalDetailDialog } from '../hooks/common/use-dialog'
import useCosmos from '../hooks/cosmos'
import useCosmosVote from '../hooks/cosmos/vote'
import { clientApi } from '../trpc/react'
import { VoteOption } from 'interchain-query/cosmos/gov/v1/gov'
import { useTranslations } from 'next-intl'
import { useToggle } from 'react-use'

import { type ProposalDetail } from '@cosmoscan/core-api'
import { cn, formatUTCTime } from '@cosmoscan/shared/utils'
import { Button } from '@cosmoscan/ui/button'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import MarkdownViewer from '@cosmoscan/ui/components/markdown-viewer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@cosmoscan/ui/dialog'
import { ScrollArea } from '@cosmoscan/ui/scroll-area'
import { Separator } from '@cosmoscan/ui/separator'
import { Skeleton } from '@cosmoscan/ui/skeleton'

export default function ProposalDetailDialog() {
  const t = useTranslations('Proposal')
  const { isWalletConnected, connect } = useCosmos()
  const { isOpen, onChange, props } = useProposalDetailDialog()
  const proposalId = useMemo(() => props?.proposalId, [props?.proposalId])

  const { data, isFetching } =
    clientApi.internal.proposal.fetchProposalDetail.useQuery(
      Number(proposalId),
      {
        enabled: !!proposalId,
      },
    )

  const voteCountTypeCards = useMemo(
    () => [
      {
        label: 'YES',
        valueKey: 'yesCount',
        activeClass: 'border-green text-green',
      },
      {
        label: 'NO',
        valueKey: 'noCount',
        activeClass: 'border-red text-red',
      },
      {
        label: 'VETO',
        valueKey: 'noWithVetoCount',
        activeClass: 'border-red text-red/50',
      },
      {
        label: 'ABSTAIN',
        valueKey: 'abstainCount',
        activeClass: 'border-red text-red/50',
      },
    ],
    [],
  )

  const showVoteButton = useMemo(() => {
    if (!!!data?.voting_start_time || !!!data?.voting_end_time) return false

    return (
      data?.voting_start_time <= Date.now() &&
      data?.voting_end_time >= Date.now()
    )
  }, [data?.voting_end_time, data?.voting_start_time])

  const [showProposalVoteDialog, toggleShowProposalVoteDialog] =
    useToggle(false)

  const onVote = useCallback(async () => {
    if (!!!data) return
    if (!isWalletConnected) {
      await connect()
      return
    }
    toggleShowProposalVoteDialog()
  }, [connect, data, isWalletConnected, toggleShowProposalVoteDialog])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onChange}>
        <DialogContent
          className="md:max-w-[800px]"
          removeScroll={false}
          isDismissDisabled
        >
          <DialogTitle></DialogTitle>

          {isFetching ? (
            <Skeleton className="h-6 w-16" />
          ) : !!data?.message_type ? (
            <TransactionTypesCell types={[data?.message_type as string]} />
          ) : null}

          {isFetching ? (
            <Skeleton className="h-8 w-36" />
          ) : (
            <div className="break-all text-lg font-medium">
              <span className="whitespace-nowrap">
                {`#${data?.proposal_id}. `}
              </span>
              <span>{data?.title || '-'}</span>
            </div>
          )}

          <div className="-mt-2 flex flex-col gap-2 md:flex-row md:items-center">
            <span className="text-foreground-secondary whitespace-nowrap">
              {t('votingTime')}:
            </span>
            {isFetching ? (
              <Skeleton className="h-6 w-24" />
            ) : !!data?.voting_start_time && !!data?.voting_end_time ? (
              <span>{`${!!data?.voting_start_time ? formatUTCTime(data?.voting_start_time) : '-'} ~ ${!!data?.voting_end_time ? formatUTCTime(data?.voting_end_time) : '-'}`}</span>
            ) : (
              '-'
            )}
          </div>

          <Separator className="mb-1 mt-4" />

          <div className="relative flex flex-col gap-4 md:flex-row md:gap-10">
            <div className="flex flex-col gap-2">
              <div className="text-foreground-secondary">
                {t('proposalResult')}
              </div>
              {isFetching ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex-items-c text-2xl font-medium">
                  <VoteStatusCell status={data?.vote_status} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-foreground-secondary">
                {t('turnoutQuorum')}
              </div>
              {isFetching ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <div className="flex-items-c text-2xl font-medium">
                  {`${data?.turnout || '-'} / ${data?.quorum || '-'}`}
                </div>
              )}
            </div>

            {showVoteButton && (
              <Button
                className="absolute inset-y-0 right-0 my-auto"
                onClick={onVote}
              >
                {t('vote')}
              </Button>
            )}
          </div>

          <div className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {voteCountTypeCards.map(({ label, valueKey, activeClass }) => (
              <div
                key={label}
                className={cn(
                  'bg-secondary flex flex-col gap-2 rounded-lg border p-4',
                  !isFetching &&
                    !!data &&
                    !!data?.voting_start_time &&
                    !!data?.voting_end_time &&
                    Math.max(
                      Number(data?.yesCount?.amount ?? 0n),
                      Number(data?.noCount?.amount ?? 0n),
                      Number(data?.noWithVetoCount?.amount ?? 0n),
                      Number(data?.abstainCount?.amount ?? 0n),
                    ) ===
                      Number(
                        (data?.[valueKey as keyof typeof data] as any)
                          ?.amount ?? 0n,
                      ) &&
                    activeClass,
                )}
              >
                <div className={cn('flex-bt-c')}>
                  <span className="uppercase">{label}</span>
                  {isFetching ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <span>
                      {(data?.[valueKey as keyof typeof data] as any)?.percent}
                    </span>
                  )}
                </div>

                <div className="flex-items-c justify-end">
                  {isFetching ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    <AmountLabel
                      className="text-foreground-secondary text-sm"
                      amount={
                        (data?.[valueKey as keyof typeof data] as any)?.amount
                      }
                      decimalPlaces={0}
                      isChainNativeToken
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary rounded-lg">
            <div className="mb-2 px-4 pt-4 text-lg">{t('description')}</div>
            {isFetching ? (
              <Skeleton className="mx-auto mb-4 h-[150px] w-[calc(100%-2rem)]" />
            ) : (
              <ScrollArea className="text-foreground-secondary h-[250px] px-4 pb-4">
                <MarkdownViewer content={data?.summary || '-'} />
              </ScrollArea>
            )}
          </div>

          {/* Proposal Metadata Links Section */}
          {!isFetching && data?.metadata && (() => {
            try {
              const metadataObj = JSON.parse(data.metadata);
              // Only show links section if at least one link exists
              const hasLinks = !!(metadataObj.ipfs || metadataObj.forum || metadataObj.additionalLink);

              if (!hasLinks) return null;

              return (
                <div className="bg-secondary mt-4 rounded-lg">
                  <div className="mb-2 px-4 pt-4 text-lg">{t('links') || 'Links'}</div>
                  <div className="px-4 pb-4 space-y-2">
                    {metadataObj.ipfs && (
                      <div className="flex items-center">
                        <span className="text-foreground-secondary mr-2 font-medium">
                          {t('ipfs') || 'IPFS'}:
                        </span>
                        <a
                          href={metadataObj.ipfs}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate"
                        >
                          {metadataObj.ipfs}
                        </a>
                      </div>
                    )}
                    {metadataObj.forum && (
                      <div className="flex items-center">
                        <span className="text-foreground-secondary mr-2 font-medium">
                          {t('forum') || 'Forum'}:
                        </span>
                        <a
                          href={metadataObj.forum}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate"
                        >
                          {metadataObj.forum}
                        </a>
                      </div>
                    )}
                    {metadataObj.additionalLink && (
                      <div className="flex items-center">
                        <span className="text-foreground-secondary mr-2 font-medium">
                          {t('additionalLink') || 'Additional Link'}:
                        </span>
                        <a
                          href={metadataObj.additionalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm truncate"
                        >
                          {metadataObj.additionalLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            } catch (e) {
              return null;
            }
          })()}
        </DialogContent>
      </Dialog>

      {!!data && (
        <ProposalVoteDialog
          isOpen={showProposalVoteDialog}
          onChange={toggleShowProposalVoteDialog}
          proposalDetail={data}
        />
      )}
    </>
  )
}

function ProposalVoteDialog({
  isOpen,
  onChange,
  proposalDetail,
}: {
  isOpen: boolean
  onChange: (open: boolean) => void
  proposalDetail: ProposalDetail | null
}) {
  // Don't render if proposalDetail is null
  if (!proposalDetail) return null;

  const t = useTranslations('Proposal')
  const commonT = useTranslations('Common')
  const { onVote, isVoting } = useCosmosVote()
  const [selectedType, setSelectedType] = useState<VoteOption>(
    VoteOption.VOTE_OPTION_UNSPECIFIED,
  )

  useEffect(() => {
    isOpen && setSelectedType(VoteOption.VOTE_OPTION_UNSPECIFIED)
  }, [isOpen])

  const voteTypeCards = useMemo(
    () => [
      {
        label: 'Yes',
        value: VoteOption.VOTE_OPTION_YES,
      },
      {
        label: 'No',
        value: VoteOption.VOTE_OPTION_NO,
      },
      {
        label: 'No With Veto',
        value: VoteOption.VOTE_OPTION_NO_WITH_VETO,
      },
      {
        label: 'Abstain',
        value: VoteOption.VOTE_OPTION_ABSTAIN,
      },
    ],
    [],
  )

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogDescription />
      <DialogContent className="md:max-w-[500px]" isDismissDisabled>
        <DialogTitle>{t('vote')}</DialogTitle>

        <div className="break-all text-lg font-medium">
          <span className="whitespace-nowrap">
            {`#${proposalDetail.proposal_id}. `}
          </span>
          <span>{proposalDetail.title || '-'}</span>
        </div>

        <Separator className="mb-4 mt-3" />

        <div className="flex flex-col gap-4">
          {voteTypeCards.map(({ label, value }) => (
            <div
              key={label}
              className={cn(
                'bg-secondary flex-items-c cursor-pointer rounded-lg border p-4 transition-opacity hover:opacity-80',
                value === selectedType
                  ? 'border-primary text-primary'
                  : 'border-transparent',
              )}
              onClick={() => setSelectedType(value)}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="my-6 text-sm">
          <span className="text-red">{t('noWithVeto')}</span>
          <span> {t('noWithVetoTip')}</span>
        </div>

        <Button
          isLoading={isVoting}
          onClick={() =>
            onVote({
              proposalId: proposalDetail.proposal_id!,
              voteType: selectedType!,
              cb: () => onChange(false),
            })
          }
        >
          {commonT('confirm')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
