'use client'

import { useCallback, useState } from 'react'

import Link from 'next/link'

import { useTranslations } from 'next-intl'

import { CodeProjectTypeEnum } from '@cosmoscan/shared/types'
import { cn } from '@cosmoscan/shared/utils'
import { Button } from '@cosmoscan/ui/button'
import { Card } from '@cosmoscan/ui/card'
import CopyWrapper from '@cosmoscan/ui/components/copy-wrapper'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@cosmoscan/ui/dialog'
import { VerifyContractBannerIcon } from '@cosmoscan/ui/icons/verify-contract/banner'
import { VerifyContractPendingIcon } from '@cosmoscan/ui/icons/verify-contract/pending'
import { Input } from '@cosmoscan/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@cosmoscan/ui/select'
import { Skeleton } from '@cosmoscan/ui/skeleton'

import { clientApi } from '@/trpc/react'

export interface CodeDetailParams {
  params: {
    code_id: number
  }
}

const optimizerTypeList = [
  { value: 'workspace', label: 'cosmwasm/workspace-optimizer' },
  { value: 'contract', label: 'cosmwasm/rust-optimizer' },
]

const optimizerVersionList = [
  '0.16.0',
  '0.15.1',
  '0.15.0',
  '0.14.0',
  '0.13.0',
  '0.12.13',
  '0.12.12',
  '0.12.11',
  '0.12.10',
  '0.12.9',
  '0.12.8',
  '0.12.7',
  '0.12.6',
  '0.12.5',
  '0.12.4',
  '0.12.3',
  '0.12.1',
  '0.12.0',
  '0.11.5',
  '0.11.4',
  '0.11.3',
  '0.11.2',
  '0.11.0',
  '0.10.9',
  '0.10.8',
  '0.10.7',
  '0.10.6',
  '0.10.5',
  '0.10.4',
  '0.10.3',
  '0.10.2',
]

export default function VerifyContract({ params }: CodeDetailParams) {
  const t = useTranslations('Contract')

  const [optimizerType, setOptimizerType] = useState<string>('workspace')
  const onOptimizerTypeChange = (newValue: string) => {
    setOptimizerType(newValue)
  }

  const [optimizerVersion, setOptimizerVersion] = useState<string>('0.16.0')
  const onOptimizerVersionChange = (newValue: string) => {
    setOptimizerVersion(newValue)
  }

  const [repositoryUrl, setRepositoryUrl] = useState<string>('')
  const onRepositoryUrlChange = (newValue: string) => {
    setRepositoryUrl(newValue)
  }

  const [branchName, setBranchName] = useState<string>('')
  const onBranchNameChange = (newValue: string) => {
    setBranchName(newValue)
  }

  const [verifyResult, setVerifyResult] = useState<any>(null)
  const verifyContractMutation =
    clientApi.internal.contract.verifyContract.useMutation()
  const handleVerify = useCallback(async () => {
    setIsDialogOpen(true)
    const result = await verifyContractMutation.mutateAsync({
      code_id: Number(params.code_id),
      project_type: optimizerType as CodeProjectTypeEnum,
      optimizer_version: optimizerVersion,
      git: repositoryUrl,
      branch: branchName,
    })
    setVerifyResult(result)
  }, [
    optimizerType,
    optimizerVersion,
    repositoryUrl,
    branchName,
    params.code_id,
    verifyContractMutation,
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const onDialogOpenChange = () => {
    setIsDialogOpen(!isDialogOpen)
  }

  return (
    <>
      <Card className="p-gap flex flex-col">
        <div className="mx-auto mb-6 text-base">
          <p className="mb-6">{t('verifyContractDescription')}</p>
          <Link
            className="text-primary w-fit"
            href="/api-doc/contract#verify"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('contractVerificationApi')}
          </Link>
        </div>
        <div className="mb-5 flex flex-row gap-2">
          <div className="flex w-[75%] flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-foreground-secondary">{t('codeId')} *</span>
              <Input value={params.code_id} readOnly />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground-secondary">
                {t('optimizerType')}
              </span>
              <Select
                value={optimizerType}
                onValueChange={onOptimizerTypeChange}
              >
                <SelectTrigger>
                  <span className="mr-1 capitalize">
                    {
                      optimizerTypeList.find(
                        item => item.value === optimizerType,
                      )?.label
                    }
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {optimizerTypeList?.map(optimizerType => (
                    <SelectItem
                      key={optimizerType.value}
                      className={cn('text-base')}
                      value={optimizerType.value}
                    >
                      <span className="mr-1 capitalize">
                        {optimizerType.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground-secondary">
                {t('optimizerVersion')}
              </span>
              <Select
                value={optimizerVersion}
                onValueChange={onOptimizerVersionChange}
              >
                <SelectTrigger>
                  <span className="mr-1 capitalize">{optimizerVersion}</span>
                </SelectTrigger>
                <SelectContent>
                  {optimizerVersionList.map(optimizerVersion => (
                    <SelectItem
                      key={optimizerVersion}
                      className={cn('text-base')}
                      value={optimizerVersion}
                    >
                      <span className="mr-1 capitalize">
                        {optimizerVersion}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground-secondary">
                {t('repositoryUrl')} *
              </span>
              <Input
                value={repositoryUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onRepositoryUrlChange(e.target.value)
                }
                placeholder="https://github.com/"
              />
              <small className="text-foreground-secondary">
                * {t('repositoryUrlTip')}
              </small>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-foreground-secondary">
                {t('branchName')} *
              </span>
              <Input
                value={branchName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onBranchNameChange(e.target.value)
                }
                placeholder="main"
              />
            </div>
          </div>
          <div className="flex-column align-center ml-[24px] flex w-[25%] justify-center gap-2 bg-[#262324] p-[86px]">
            <VerifyContractBannerIcon />
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <Button
            disabled={!repositoryUrl || !branchName}
            onClick={handleVerify}
          >
            {t('verifyAndPublish')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setOptimizerType('workspace')
              setOptimizerVersion('0.16.0')
              setRepositoryUrl('')
              setBranchName('')
            }}
          >
            {t('reset')}
          </Button>
        </div>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
        <DialogContent>
          <div className="my-4 flex animate-spin items-center justify-center">
            <VerifyContractPendingIcon />
          </div>
          <DialogHeader>
            <DialogTitle className="text-bold text-center text-[20px]">
              {t('pending')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex flex-col gap-3">
            <div>
              {t.rich('submittedSuccessfully', {
                resultLink: chunks => (
                  <Link
                    href={`/code/${params.code_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    {chunks}
                  </Link>
                ),
              })}
              <div className="my-[12px]"></div>
              {t('verificationTaskGuid')}:
              {verifyResult ? (
                <CopyWrapper
                  classNames={{ root: 'break-all' }}
                  copyText={verifyResult}
                >
                  <b>{verifyResult}</b>
                </CopyWrapper>
              ) : (
                <Skeleton className="mt-2 h-6 w-full" />
              )}
              <div className="my-[12px]"></div>
              {t('checkVerificationStatus')}:{' '}
              <Link
                href="/api-doc/contract#checkVerifyStatus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                {t('contractVerificationApi')}
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
