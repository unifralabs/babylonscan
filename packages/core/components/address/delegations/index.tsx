'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'

import {
  useAddressDelegationRewards,
  useAddressDelegations,
  useAddressRedelegations,
  useAddressUnbondingDelegations,
  useValidatorInfo,
} from './hooks'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { formatNumWithCommas, formatUnits } from '@cosmoscan/shared/utils'
import DataTable from '@cosmoscan/ui/components/data-table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@cosmoscan/ui/select'
import { Skeleton } from '@cosmoscan/ui/skeleton'

// Define interfaces for our formatted data
interface FormattedDelegation {
  validatorAddress: string
  validatorName: string
  stakedAmount: string
  rewardAmount: string
  denom: string
  type: 'delegations' | 'unbonding' | 'redelegations'
  sourceValidatorAddress?: string
  sourceValidatorName?: string
  completionTime?: string
}

// Validator name component with link
function ValidatorName({ address }: { address: string }) {
  const { validatorInfo, isFetching } = useValidatorInfo(address)

  if (isFetching) {
    return <Skeleton className="h-5 w-32" />
  }

  const displayName = validatorInfo?.moniker || address

  return (
    <Link
      href={`/validator/${address}`}
      className="text-primary hover:underline"
    >
      {displayName}
    </Link>
  )
}

export default function AddressDelegations({
  address,
  hideSinglePage = true,
  autoEmptyCellHeight = false,
}: {
  address: string
  hideSinglePage?: boolean
  autoEmptyCellHeight?: boolean
}) {
  const t = useTranslations('Address')
  const [delegationType, setDelegationType] = useState<
    'delegations' | 'unbonding' | 'redelegations'
  >('delegations')

  // Fetch delegations data
  const { delegations, isFetching: isDelegationsFetching } =
    useAddressDelegations(address)

  // Fetch unbonding delegations data
  const { unbondingDelegations, isFetching: isUnbondingFetching } =
    useAddressUnbondingDelegations(address)

  // Fetch redelegations data
  const { redelegations, isFetching: isRedelegationsFetching } =
    useAddressRedelegations(address)

  // Fetch rewards data
  const { rewards, isFetching: isRewardsFetching } =
    useAddressDelegationRewards(address)

  // Determine if data is loading
  const isFetching = useMemo(() => {
    return (
      isDelegationsFetching ||
      isUnbondingFetching ||
      isRedelegationsFetching ||
      isRewardsFetching
    )
  }, [
    isDelegationsFetching,
    isUnbondingFetching,
    isRedelegationsFetching,
    isRewardsFetching,
  ])

  // Format delegations data for the table
  const formattedDelegations = useMemo((): FormattedDelegation[] => {
    return delegations.map(delegation => {
      const validatorAddress = delegation.delegation?.validatorAddress || ''
      const validatorName = validatorAddress // We'll use the ValidatorName component to display the actual name
      const stakedAmount = delegation.balance?.amount || '0'
      const rewardAmount = rewards[validatorAddress]?.amount || '0'

      return {
        validatorAddress,
        validatorName,
        stakedAmount,
        rewardAmount,
        denom: delegation.balance?.denom || CURRENT_CHAIN.nativeToken.denom,
        type: 'delegations',
      }
    })
  }, [delegations, rewards])

  // Format unbonding delegations data for the table
  const formattedUnbonding = useMemo((): FormattedDelegation[] => {
    return unbondingDelegations.flatMap(unbonding => {
      const validatorAddress = unbonding.validatorAddress || ''
      const validatorName = validatorAddress // We'll use the ValidatorName component to display the actual name

      return (
        unbonding.entries?.map(entry => ({
          validatorAddress,
          validatorName,
          stakedAmount: entry.balance || '0',
          rewardAmount: '0', // No rewards for unbonding
          denom: CURRENT_CHAIN.nativeToken.denom,
          completionTime: entry.completionTime
            ? entry.completionTime.toString()
            : undefined,
          type: 'unbonding' as const,
        })) || []
      )
    })
  }, [unbondingDelegations])

  // Format redelegations data for the table
  const formattedRedelegations = useMemo((): FormattedDelegation[] => {
    return redelegations.flatMap(redelegation => {
      // Access properties safely with optional chaining
      const validatorSrcAddress =
        redelegation.redelegation?.validatorSrcAddress || ''
      const validatorDstAddress =
        redelegation.redelegation?.validatorDstAddress || ''

      return (
        redelegation.entries?.map(entry => ({
          validatorAddress: validatorDstAddress,
          validatorName: validatorDstAddress, // We'll use the ValidatorName component to display the actual name
          sourceValidatorAddress: validatorSrcAddress,
          sourceValidatorName: validatorSrcAddress, // We'll use the ValidatorName component to display the actual name
          stakedAmount: entry.balance || '0',
          rewardAmount: '0', // No rewards during redelegation
          denom: CURRENT_CHAIN.nativeToken.denom,
          completionTime: entry.redelegationEntry?.completionTime
            ? entry.redelegationEntry.completionTime.toString()
            : undefined,
          type: 'redelegations' as const,
        })) || []
      )
    })
  }, [redelegations])

  // Get data based on selected type
  const filteredData = useMemo(() => {
    if (delegationType === 'delegations') {
      return formattedDelegations
    } else if (delegationType === 'unbonding') {
      return formattedUnbonding
    } else {
      return formattedRedelegations
    }
  }, [
    delegationType,
    formattedDelegations,
    formattedUnbonding,
    formattedRedelegations,
  ])

  // Define columns for the table
  const columns: ColumnDef<FormattedDelegation>[] = useMemo(
    () => [
      {
        accessorKey: 'validatorName',
        header: t('validator'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <ValidatorName address={row.original.validatorAddress} />
          </div>
        ),
        meta: { isMobileFullRow: true },
      },
      // Only show source validator for redelegations
      ...(delegationType === 'redelegations'
        ? [
            {
              accessorKey: 'sourceValidatorName',
              header: 'From ' + t('validator'),
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <ValidatorName
                    address={row.original.sourceValidatorAddress || ''}
                  />
                </div>
              ),
              meta: { isMobileFullRow: true },
            } as ColumnDef<FormattedDelegation>,
          ]
        : []),
      {
        accessorKey: 'stakedAmount',
        header: t('stakedAmount'),
        cell: ({ row }) =>
          `${formatNumWithCommas(
            formatUnits(
              BigInt(row.original.stakedAmount),
              CURRENT_CHAIN.nativeToken.decimals,
            ),
          )} ${CURRENT_CHAIN.nativeToken.symbol}`,
        meta: { textAlign: 'right' },
      },
      {
        accessorKey: 'rewardAmount',
        header: t('rewardAmount'),
        cell: ({ row }) =>
          `${formatNumWithCommas(
            formatUnits(
              BigInt(row.original.rewardAmount),
              CURRENT_CHAIN.nativeToken.decimals,
            ),
          )} ${CURRENT_CHAIN.nativeToken.symbol}`,
        meta: { textAlign: 'right' },
      },
      // Only show completion time for unbonding and redelegations
      ...(delegationType === 'unbonding' || delegationType === 'redelegations'
        ? [
            {
              accessorKey: 'completionTime',
              header: 'Completion Time',
              cell: ({ row }) => {
                if (!row.original.completionTime) return '-'
                const date = new Date(row.original.completionTime)
                return date.toLocaleString()
              },
              meta: { textAlign: 'right' },
            } as ColumnDef<FormattedDelegation>,
          ]
        : []),
    ],
    [t, delegationType],
  )

  // Filter component for the DataTable
  const filterComponent = (
    <div className="flex items-center">
      <Select
        value={delegationType}
        onValueChange={value =>
          setDelegationType(
            value as 'delegations' | 'unbonding' | 'redelegations',
          )
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="delegations">{t('delegations')}</SelectItem>
          <SelectItem value="unbonding">{t('unbonding')}</SelectItem>
          <SelectItem value="redelegations">{t('redelegations')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      isLoading={isFetching}
      autoEmptyCellHeight={autoEmptyCellHeight}
      filterComponent={filterComponent}
      emptyText={
        delegationType === 'delegations'
          ? t('noDelegations')
          : delegationType === 'unbonding'
            ? t('noUnbonding')
            : t('noRedelegations')
      }
    />
  )
}
