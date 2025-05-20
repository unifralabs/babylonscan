import { type Metadata } from 'next'
import Link from 'next/link'

import { getTranslations } from 'next-intl/server'

import ExternalLinkRenderer from '@cosmoscan/core/components/external-link-renderer'
import { formatPageTitle } from '@cosmoscan/shared/utils'
import { Button } from '@cosmoscan/ui/button'
import { Card, PageCardTitle } from '@cosmoscan/ui/card'
import DetailItems from '@cosmoscan/ui/components/detail-items'
import PageLinkTabs from '@cosmoscan/ui/components/page-link-tabs'
import RustProjectViewer from '@cosmoscan/ui/components/rust-project-viewer'
import { FilledCircleCheck } from '@cosmoscan/ui/icons/filled-circle-check'
import { Separator } from '@cosmoscan/ui/separator'

import CodeContractsTable from '@/components/code/code-contracts-table'
import { serverApi } from '@/trpc/server'

export interface CodeDetailParams {
  params: {
    code_id: number
  }
}

const permissionMap = {
  [0]: 'Unspecified',
  [1]: 'Nobody',
  [3]: 'Everybody',
  [4]: 'Limited Addresses',
}

export async function generateMetadata({
  params: { code_id },
}: CodeDetailParams): Promise<Metadata> {
  const t = await getTranslations('PageMetadata.ContractCode')
  return {
    title: formatPageTitle(t('title', { codeId: code_id })),
    description: t('description', { codeId: code_id }),
  }
}

export default async function CodeDetail({ params }: CodeDetailParams) {
  const t = await getTranslations('Contract')
  const commonT = await getTranslations('Common')
  const codeDetail = await serverApi.internal.code.fetchCodeDetail(
    Number(params.code_id),
  )

  const items = [
    [
      {
        label: t('verified'),
        value: codeDetail?.is_verified ? (
          <span className="text-green">{commonT('yes')}</span>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-red">{commonT('no')}</span>
            <Button
              size="sm"
              className="bg-primary dark:bg-accent hover:bg-primary/80 hover:dark:bg-accent/80 text-white hover:text-white/80"
            >
              <Link href={`/code/verify/${params.code_id}`}>
                {t('verifyContract')}
              </Link>
            </Button>
          </div>
        ),
      },
      {
        label: t('codeId'),
        value: codeDetail?.code_id,
      },
      /*
      {
        label: t('contractCounts'),
        value: codeDetail?.id,
      },
      */
      {
        label: t('checksum'),
        value: codeDetail?.data_hash,
      },
      {
        label: t('creatorAccount'),
        value: (
          <ExternalLinkRenderer
            type="address"
            content={codeDetail?.creator ?? ''}
            short={false}
          />
        ),
      },
      {
        label: t('permission'),
        value:
          t(
            permissionMap[
              (codeDetail?.permission ?? 0) as keyof typeof permissionMap
            ].toLowerCase(),
          ) ?? '-',
      },
    ],
  ]

  function findLibFile(
    sources: Record<string, { content: string }>,
  ): string | null {
    for (const [path, _] of Object.entries(sources)) {
      if (path.endsWith('lib.rs')) {
        return path
      }
    }
    return null
  }

  function buildFullRepository(
    repoUrl: string | null,
    branchName: string | null,
  ): string | null {
    if (!branchName || !repoUrl) {
      return repoUrl
    }
    return `${repoUrl}${repoUrl.endsWith('/') ? '' : '/'}tree/${branchName}`
  }

  return (
    <>
      <PageCardTitle>{commonT('overview')}</PageCardTitle>
      <Card className="p-gap flex flex-col">
        {items.map((item, index) => (
          <div key={index}>
            {!!index && <Separator className="my-gap" />}
            <DetailItems key={index} items={item} />
          </div>
        ))}
      </Card>

      <Card className="mt-gap p-gap">
        <PageLinkTabs
          queryKey="tab"
          defaultValue="contracts"
          tabs={[
            {
              value: 'contracts',
              valueContent: (
                <div className="flex-c gap-3">
                  <span>{t('contracts')}</span>
                </div>
              ),
              content: <CodeContractsTable code_id={String(params.code_id)} />,
            },
            ...(codeDetail?.is_verified
              ? [
                  {
                    value: 'source_code',
                    valueContent: (
                      <div className="flex-c items-center gap-3">
                        <span>{t('sourceCode')}</span>
                        {codeDetail?.source_code && (
                          <FilledCircleCheck className="text-green h-4 w-4" />
                        )}
                      </div>
                    ),
                    content: (
                      <Card className="p-gap bg-secondary my-4 w-full">
                        {codeDetail?.source_code ? (
                          <RustProjectViewer
                            projectStructure={JSON.parse(
                              codeDetail.source_code,
                            )}
                            openFilePath={findLibFile(
                              JSON.parse(codeDetail.source_code)?.sources,
                            )}
                            repositoryUrl={buildFullRepository(
                              codeDetail.repository_url,
                              codeDetail.branch_name,
                            )}
                          />
                        ) : (
                          <div className="text-left">{t('noSourceCode')}</div>
                        )}
                      </Card>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </>
  )
}
