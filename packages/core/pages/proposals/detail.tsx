'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import ProposalDepositsTable from '../../components/proposal/deposits-table'
import ProposalVotesTable from '../../components/proposal/votes-table'
import {
  TransactionTypesCell,
  VoteStatusCell,
} from '../../components/table-cell-renderer'
import useCosmos from '../../hooks/cosmos'
import useCosmosVote from '../../hooks/cosmos/vote'
import { clientApi } from '../../trpc/react'
import { VoteOption } from 'interchain-query/cosmos/gov/v1/gov'
import { ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToggle } from 'react-use'

import type { ProposalDetail } from '@cosmoscan/core-api'
import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { cn, formatUTCTime } from '@cosmoscan/shared/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@cosmoscan/ui/accordion'
import { Button } from '@cosmoscan/ui/button'
import { Card } from '@cosmoscan/ui/card'
import { AmountLabel } from '@cosmoscan/ui/components/amount-label'
import JsonViewer from '@cosmoscan/ui/components/json-viewer'
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

export type ProposalDetailProps = {
  params: {
    id: string
  }
}

export default function ProposalDetail({ params }: ProposalDetailProps) {
  const t = useTranslations('Proposal')
  const { isWalletConnected, connect } = useCosmos()
  const proposalId = Number(params.id)
  const router = useRouter()

  const { data, isFetching, error } =
    clientApi.internal.proposal.fetchProposalDetail.useQuery(proposalId, {
      enabled: !!proposalId,
    })

  // Redirect to the proposals list if the proposal doesn't exist
  useEffect(() => {
    if (!isFetching && !data && error) {
      router.push('/proposals')
    }
  }, [data, error, isFetching, router])

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
      <Card className="p-gap">
        <div className="mb-21">
          {isFetching ? (
            <Skeleton className="mb-3 h-6 w-16" />
          ) : !!data?.message_type ? (
            <div className="mb-3">
              <TransactionTypesCell
                types={data?.message_types || [data?.message_type as string]}
              />
            </div>
          ) : null}

          {isFetching ? (
            <Skeleton className="mb-3 h-8 w-3/4" />
          ) : (
            <div className="mb-3 break-all text-xl font-medium">
              <span className="whitespace-nowrap">
                {`#${data?.proposal_id}. `}
              </span>
              <span>{data?.title || '-'}</span>
            </div>
          )}

          {isFetching ? (
            <Skeleton className="mb-3 h-6 w-1/3" />
          ) : !!data?.proposer ? (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-foreground-secondary font-medium">
                {t('proposer')}:
              </span>
              <ExternalLinkRenderer
                type="address"
                content={data.proposer}
                showTooltip={true}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <span className="text-foreground-secondary whitespace-nowrap font-medium">
              {t('votingTime')}:
            </span>
            {isFetching ? (
              <Skeleton className="h-6 w-64" />
            ) : !!data?.voting_start_time && !!data?.voting_end_time ? (
              <span className="text-base">
                {`${!!data?.voting_start_time ? formatUTCTime(data?.voting_start_time) : '-'} ~ ${!!data?.voting_end_time ? formatUTCTime(data?.voting_end_time) : '-'}`}
              </span>
            ) : (
              '-'
            )}
          </div>

          {isFetching ? (
            <Skeleton className="mt-2 h-6 w-1/3" />
          ) : data?.expedited !== undefined ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-foreground-secondary font-medium">
                {t('expedited')}:
              </span>
              <span>{data.expedited ? 'Yes' : 'No'}</span>
            </div>
          ) : null}
        </div>

        <Separator className="mb-6 mt-2" />

        <div className="relative mb-8 flex flex-col gap-6 md:flex-row md:gap-16">
          <div className="flex flex-col gap-2">
            <div className="text-foreground-secondary font-medium">
              {t('proposalResult')}
            </div>
            {isFetching ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex-items-c text-2xl font-medium">
                <VoteStatusCell status={data?.vote_status} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-foreground-secondary font-medium">
              {t('turnoutQuorum')}
            </div>
            {isFetching ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex-items-c text-2xl font-medium">
                {`${data?.turnout || '-'} / ${data?.quorum || '-'}`}
              </div>
            )}
          </div>

          {showVoteButton && (
            <Button
              className="mt-4 md:absolute md:inset-y-0 md:right-0 md:my-auto md:mt-0"
              onClick={onVote}
              size="lg"
            >
              {t('vote')}
            </Button>
          )}
        </div>

        <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {voteCountTypeCards.map(({ label, valueKey, activeClass }) => (
            <div
              key={label}
              className={cn(
                'bg-secondary flex flex-col gap-3 rounded-lg border p-5',
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
                      (data?.[valueKey as keyof typeof data] as any)?.amount ??
                        0n,
                    ) &&
                  activeClass,
              )}
            >
              <div className={cn('flex-bt-c')}>
                <span className="font-bold uppercase">{label}</span>
                {isFetching ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <span className="text-lg">
                    {(data?.[valueKey as keyof typeof data] as any)?.percent}
                  </span>
                )}
              </div>

              <div className="flex-items-c justify-end">
                {isFetching ? (
                  <Skeleton className="h-5 w-32" />
                ) : (
                  <AmountLabel
                    className="text-foreground-secondary text-base"
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

        <div className="bg-secondary mt-8 rounded-lg">
          <div className="mb-4 px-6 pt-6 text-xl font-medium">
            {t('description')}
          </div>
          {isFetching ? (
            <Skeleton className="mx-auto mb-6 h-[200px] w-[calc(100%-3rem)]" />
          ) : (
            <ScrollArea className="text-foreground-secondary px-6 pb-6">
              <MarkdownViewer content={data?.summary || '-'} />
            </ScrollArea>
          )}
        </div>

        {/* Proposal Messages Section */}
        {!isFetching &&
          data?.messages &&
          Array.isArray(data.messages) &&
          data.messages.length > 0 && (
            <div className="bg-secondary mt-8 rounded-lg">
              <div className="mb-4 px-6 pt-6 text-xl font-medium">
                {t('proposalMessages') || 'Proposal Messages'}
              </div>
              <ScrollArea className="text-foreground-secondary max-h-[500px] px-6 pb-6">
                <Accordion type="multiple" className="w-full">
                  {data.messages.map((message: any, index: number) => {
                    const messageType = data?.message_types?.[index] || '-'
                    const isSoftwareUpgrade =
                      messageType.includes('MsgSoftwareUpgrade')
                    const isCommunityPoolSpend = messageType.includes(
                      'MsgCommunityPoolSpend',
                    )
                    const isParameterChange = messageType.includes(
                      'MsgParameterChangeProposal',
                    )
                    const isUpdateParams =
                      messageType.includes('MsgUpdateParams')
                    const isResumeFinalityProposal = messageType.includes(
                      'MsgResumeFinalityProposal',
                    )

                    return (
                      <AccordionItem key={index} value={`message-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                            <span className="font-medium">{messageType}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-background/50 rounded p-4">
                            {/* Software Upgrade Message */}
                            {isSoftwareUpgrade && message.plan && (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('upgradeHeight') || 'Upgrade Height'}:
                                  </span>
                                  <ExternalLinkRenderer
                                    type="block"
                                    content={message.plan.height}
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('name') || 'Name'}:
                                  </span>
                                  <span>{message.plan.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('info') || 'Info'}:
                                  </span>
                                  <span>{message.plan.info}</span>
                                </div>
                                {message.plan.time &&
                                !message.plan.time.includes("0001-01-01T00:00:00") &&
                                !message.plan.time.includes("1970-01-01T00:00:00") && (
                                  <div className="flex items-center">
                                    <span className="text-foreground-secondary mr-2 font-medium">
                                      {t('time') || 'Time'}:
                                    </span>
                                    <span>{formatUTCTime(new Date(message.plan.time).getTime())}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Community Pool Spend Message */}
                            {isCommunityPoolSpend && (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('recipient') || 'Recipient'}:
                                  </span>
                                  <ExternalLinkRenderer
                                    type="address"
                                    content={message.recipient}
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('amount') || 'Amount'}:
                                  </span>
                                  <AmountLabel
                                    amount={message.amount?.[0]?.amount}
                                    decimalPlaces={0}
                                    isChainNativeToken
                                  />
                                </div>
                              </div>
                            )}

                            {/* Parameter Change Message */}
                            {isParameterChange && message.changes && (
                              <div className="space-y-2">
                                {message.changes.map(
                                  (change: any, changeIndex: number) => (
                                    <div
                                      key={changeIndex}
                                      className="border-border/50 border-b pb-2 last:border-0"
                                    >
                                      <div className="flex items-center">
                                        <span className="text-foreground-secondary mr-2 font-medium">
                                          {t('subspace') || 'Subspace'}:
                                        </span>
                                        <span>{change.subspace}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <span className="text-foreground-secondary mr-2 font-medium">
                                          {t('key') || 'Key'}:
                                        </span>
                                        <span>{change.key}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <span className="text-foreground-secondary mr-2 font-medium">
                                          {t('value') || 'Value'}:
                                        </span>
                                        <span className="font-mono">
                                          {change.value}
                                        </span>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            )}

                            {/* Update Params Message */}
                            {isUpdateParams && message.params && (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('authority') || 'Authority'}:
                                  </span>
                                  <ExternalLinkRenderer
                                    type="address"
                                    content={message.authority}
                                  />
                                </div>
                                <div className="space-y-2">
                                  {Object.entries(message.params).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-center"
                                      >
                                        <span className="text-foreground-secondary mr-2 font-medium">
                                          {t(key) || key}:
                                        </span>
                                        <span className="font-mono">
                                          {typeof value === 'boolean'
                                            ? value.toString()
                                            : typeof value === 'string'
                                              ? value
                                              : JSON.stringify(value)}
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Resume Finality Proposal Message */}
                            {isResumeFinalityProposal && (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="text-foreground-secondary mr-2 font-medium">
                                    {t('authority') || 'Authority'}:
                                  </span>
                                  <ExternalLinkRenderer
                                    type="address"
                                    content={message.authority}
                                  />
                                </div>
                                {message.halting_height && (
                                  <div className="flex items-center">
                                    <span className="text-foreground-secondary mr-2 font-medium">
                                      {t('haltingHeight') || 'Halting Height'}:
                                    </span>
                                    <ExternalLinkRenderer
                                      type="block"
                                      content={message.halting_height.toString()}
                                    />
                                  </div>
                                )}
                                {message.fp_pks_hex &&
                                  Array.isArray(message.fp_pks_hex) && (
                                    <div className="flex flex-col">
                                      <span className="text-foreground-secondary mb-1 mr-2 font-medium">
                                        {t('finalityProviderPublicKeys') ||
                                          'Finality Provider Public Keys'}
                                        :
                                      </span>
                                      <div className="bg-background/30 mt-1 space-y-1 rounded-md p-2">
                                        {message.fp_pks_hex.map(
                                          (pk: string, pkIndex: number) => (
                                            <div
                                              key={pkIndex}
                                              className="flex items-center"
                                            >
                                              <span className="overflow-auto truncate font-mono text-xs">
                                                {pk}
                                              </span>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}

                            {/* Raw JSON Data */}
                            <div className="border-border/50 mt-4 border-t pt-4">
                              <div className="text-foreground-secondary mb-2 font-medium">
                                {t('rawData') || 'Raw Data'}:
                              </div>
                              <JsonViewer src={message} collapsed={1} />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </ScrollArea>
            </div>
          )}

        {/* Proposal Metadata Links Section */}
        {!isFetching && data?.metadata && (() => {
          try {
            const metadataObj = JSON.parse(data.metadata);
            // Only show links section if at least one link exists
            const hasLinks = !!(metadataObj.ipfs || metadataObj.forum || metadataObj.additionalLink);

            if (!hasLinks) return null;

            return (
              <div className="bg-secondary mt-8 rounded-lg">
                <div className="mb-4 px-6 pt-6 text-xl font-medium">
                  {t('links') || 'Links'}
                </div>
                <div className="px-6 pb-6 space-y-2">
                  {metadataObj.ipfs && (
                    <div className="flex items-center">
                      <span className="text-foreground-secondary mr-2 font-medium">
                        {t('ipfs') || 'IPFS'}:
                      </span>
                      <a
                        href={metadataObj.ipfs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
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
                        className="text-primary hover:underline"
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
                        className="text-primary hover:underline"
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
      </Card>

      {/* Votes Section - Now outside the main card */}
      <div className="mt-8">
        {isFetching ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ProposalVotesTable proposalId={proposalId} />
        )}
      </div>

      {/* Deposits Section - Below the votes table */}
      <div className="mt-8">
        {isFetching ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ProposalDepositsTable proposalId={proposalId} />
        )}
      </div>

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
  const t = useTranslations('Proposal')
  const commonT = useTranslations('Common')
  const { onVote, isVoting } = useCosmosVote()
  const [selectedType, setSelectedType] = useState<VoteOption>(
    VoteOption.VOTE_OPTION_UNSPECIFIED,
  )

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

  // If proposalDetail is null, don't render the dialog
  if (!proposalDetail) return null

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
