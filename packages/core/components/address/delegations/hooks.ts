import { useMemo } from 'react'
import { useCosmosQueryContext } from '../../../providers/cosmos'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { formatUnits } from '@cosmoscan/shared/utils'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { type QueryFunctionContext } from '@tanstack/react-query'
import { QueryDelegatorDelegationsResponse } from 'interchain-query/cosmos/staking/v1beta1/query'
import { QueryDelegatorUnbondingDelegationsResponse } from 'interchain-query/cosmos/staking/v1beta1/query'
import { QueryRedelegationsResponse } from 'interchain-query/cosmos/staking/v1beta1/query'

// Keys for React Query
export function getAddressDelegationsQueryKey(address?: string) {
  return ['address-delegations', address]
}

export function getAddressUnbondingDelegationsQueryKey(address?: string) {
  return ['address-unbonding-delegations', address]
}

export function getAddressRedelegationsQueryKey(address?: string) {
  return ['address-redelegations', address]
}

export function getAddressDelegationRewardsQueryKey(address?: string) {
  return ['address-delegation-rewards', address]
}

export function getValidatorInfoQueryKey(validatorAddress?: string) {
  return ['validator-info', validatorAddress]
}

// Hook for fetching delegations
export function useAddressDelegations(address?: string) {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: getAddressDelegationsQueryKey(address),
      initialPageParam: undefined,
      queryFn: (data =>
        cosmosQuery?.staking.v1beta1.delegatorDelegations({
          delegatorAddr: address!,
          pagination: {
            key: (data?.pageParam || new Uint8Array()) as Uint8Array,
            offset: 0n,
            limit: 100n,
            countTotal: true,
            reverse: false,
          },
        })) as (
        context: QueryFunctionContext,
      ) => Promise<QueryDelegatorDelegationsResponse>,
      getNextPageParam: lastPage =>
        lastPage?.pagination?.nextKey?.length === 0
          ? undefined
          : lastPage?.pagination?.nextKey,
      enabled: !!cosmosQuery && !!address,
      staleTime: 60 * 1000, // 1 minute
    })

  const delegations = useMemo(
    () => data?.pages?.flatMap(page => page?.delegationResponses) || [],
    [data?.pages],
  )

  const total = useMemo(
    () => Number(data?.pages?.[0]?.pagination?.total ?? 0),
    [data?.pages],
  )

  return {
    delegations,
    total,
    isFetching: isFetching || !cosmosQuery,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}

// Hook for fetching delegation rewards
export function useAddressDelegationRewards(address?: string) {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, refetch } = useQuery({
    queryKey: getAddressDelegationRewardsQueryKey(address),
    queryFn: () =>
      cosmosQuery?.distribution.v1beta1.delegationTotalRewards({
        delegatorAddress: address!,
      }),
    enabled: !!cosmosQuery && !!address,
    staleTime: 60 * 1000, // 1 minute
  })

  const rewards = useMemo(() => {
    if (!data?.rewards) return {}
    
    return data.rewards.reduce((acc, { validatorAddress, reward }) => {
      const amount = reward.find(r => r.denom === CURRENT_CHAIN.nativeToken.denom)?.amount || '0'
      // Remove decimal part if exists
      const cleanAmount = amount.split('.')[0]
      
      acc[validatorAddress] = {
        amount: cleanAmount,
        formatted: formatUnits(
          BigInt(cleanAmount),
          CURRENT_CHAIN.nativeToken.decimals
        ),
      }
      return acc
    }, {} as Record<string, { amount: string; formatted: string }>)
  }, [data?.rewards])

  return {
    rewards,
    isFetching: isFetching || !cosmosQuery,
    refetch,
  }
}

// Hook for fetching unbonding delegations
export function useAddressUnbondingDelegations(address?: string) {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: getAddressUnbondingDelegationsQueryKey(address),
      initialPageParam: undefined,
      queryFn: (data =>
        cosmosQuery?.staking.v1beta1.delegatorUnbondingDelegations({
          delegatorAddr: address!,
          pagination: {
            key: (data?.pageParam || new Uint8Array()) as Uint8Array,
            offset: 0n,
            limit: 100n,
            countTotal: true,
            reverse: false,
          },
        })) as (
        context: QueryFunctionContext,
      ) => Promise<QueryDelegatorUnbondingDelegationsResponse>,
      getNextPageParam: lastPage =>
        lastPage?.pagination?.nextKey?.length === 0
          ? undefined
          : lastPage?.pagination?.nextKey,
      enabled: !!cosmosQuery && !!address,
      staleTime: 60 * 1000, // 1 minute
    })

  const unbondingDelegations = useMemo(
    () => data?.pages?.flatMap(page => page?.unbondingResponses) || [],
    [data?.pages],
  )

  const total = useMemo(
    () => Number(data?.pages?.[0]?.pagination?.total ?? 0),
    [data?.pages],
  )

  return {
    unbondingDelegations,
    total,
    isFetching: isFetching || !cosmosQuery,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}

// Hook for fetching redelegations
export function useAddressRedelegations(address?: string) {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: getAddressRedelegationsQueryKey(address),
      initialPageParam: undefined,
      queryFn: (data =>
        cosmosQuery?.staking.v1beta1.redelegations({
          delegatorAddr: address!,
          pagination: {
            key: (data?.pageParam || new Uint8Array()) as Uint8Array,
            offset: 0n,
            limit: 100n,
            countTotal: true,
            reverse: false,
          },
        })) as (
        context: QueryFunctionContext,
      ) => Promise<QueryRedelegationsResponse>,
      getNextPageParam: lastPage =>
        lastPage?.pagination?.nextKey?.length === 0
          ? undefined
          : lastPage?.pagination?.nextKey,
      enabled: !!cosmosQuery && !!address,
      staleTime: 60 * 1000, // 1 minute
    })

  const redelegations = useMemo(
    () => data?.pages?.flatMap(page => page?.redelegationResponses) || [],
    [data?.pages],
  )

  const total = useMemo(
    () => Number(data?.pages?.[0]?.pagination?.total ?? 0),
    [data?.pages],
  )

  return {
    redelegations,
    total,
    isFetching: isFetching || !cosmosQuery,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}

// Hook for fetching validator info
export function useValidatorInfo(validatorAddress?: string) {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, refetch } = useQuery({
    queryKey: getValidatorInfoQueryKey(validatorAddress),
    queryFn: () =>
      cosmosQuery?.staking.v1beta1.validator({
        validatorAddr: validatorAddress!,
      }),
    enabled: !!cosmosQuery && !!validatorAddress,
    staleTime: 60 * 60 * 1000, // 1 hour
  })

  const validatorInfo = useMemo(() => {
    if (!data?.validator) return null
    
    return {
      address: validatorAddress,
      moniker: data.validator.description?.moniker || '',
      identity: data.validator.description?.identity || '',
      website: data.validator.description?.website || '',
      details: data.validator.description?.details || '',
      commission: data.validator.commission?.commissionRates?.rate || '',
      tokens: data.validator.tokens || '0',
    }
  }, [data?.validator, validatorAddress])

  return {
    validatorInfo,
    isFetching: isFetching || !cosmosQuery,
    refetch,
  }
} 