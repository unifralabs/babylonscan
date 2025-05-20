import { useMemo } from 'react'

import useCosmos from '.'
import { useCosmosQueryContext } from '../../providers/cosmos'
import {
  useInfiniteQuery,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { QueryDelegatorValidatorsResponse } from 'interchain-query/cosmos/staking/v1beta1/query'

import { CONSTANT } from '@cosmoscan/shared/constants/common'

export function getCosmosValidatorsQueryKey() {
  return ['cosmos-stake-validators']
}

export function useCosmosValidatorsList() {
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: getCosmosValidatorsQueryKey(),
      initialPageParam: undefined,
      getNextPageParam: lastPage =>
        lastPage?.pagination?.nextKey?.length === 0
          ? undefined
          : lastPage?.pagination?.nextKey,
      queryFn: (data =>
        cosmosQuery?.staking.v1beta1.validators({
          // status: cosmos.staking.v1beta1.bondStatusToJSON(
          //   cosmos.staking.v1beta1.BondStatus.BOND_STATUS_BONDED,
          // ),
          status: '',
          pagination: {
            key: (data?.pageParam || new Uint8Array()) as Uint8Array,
            offset: 0n,
            limit: 200n,
            countTotal: true,
            reverse: false,
          },
        })) as (
        context: QueryFunctionContext,
      ) => Promise<QueryDelegatorValidatorsResponse>,
      enabled: !!cosmosQuery,
      staleTime: Infinity,
    })

  const validators = useMemo(
    () =>
      (data?.pages?.flatMap(page => page?.validators) || []).sort((a, b) =>
        BigNumber(b.tokens).minus(a.tokens).toNumber(),
      ),
    [data?.pages],
  )

  const total = useMemo(
    () => Number(data?.pages?.[0]?.pagination?.total ?? 0),
    [data?.pages],
  )

  return {
    validators,
    total,
    isFetching: isFetching || !cosmosQuery,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}

export function getCosmosStakingValidatorsQueryKey(address?: string) {
  return ['cosmos-stake-history', address]
}

export function useCosmosStakingValidatorsList(
  { enabled, limit }: { enabled?: boolean; limit?: number } = {
    enabled: true,
    limit: CONSTANT.tableDefaultPageSize,
  },
) {
  const { address } = useCosmos()
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: getCosmosStakingValidatorsQueryKey(address),
      initialPageParam: undefined,
      getNextPageParam: lastPage =>
        lastPage?.pagination?.nextKey?.length === 0
          ? undefined
          : lastPage?.pagination?.nextKey,
      queryFn: (data =>
        cosmosQuery?.staking.v1beta1.delegatorValidators({
          delegatorAddr: address!,
          pagination: {
            key: (data?.pageParam || new Uint8Array()) as Uint8Array,
            offset: 0n,
            limit: BigInt(limit ?? CONSTANT.tableDefaultPageSize),
            countTotal: true,
            reverse: false,
          },
        })) as (
        context: QueryFunctionContext,
      ) => Promise<QueryDelegatorValidatorsResponse>,
      enabled: enabled && !!cosmosQuery && !!address,
      staleTime: Infinity,
    })

  const stakingValidators = useMemo(
    () =>
      (data?.pages?.flatMap(page => page?.validators) || []).sort((a, b) =>
        BigNumber(b.tokens).minus(a.tokens).toNumber(),
      ),
    [data?.pages],
  )

  const total = useMemo(
    () => Number(data?.pages?.[0]?.pagination?.total ?? 0),
    [data?.pages],
  )

  return {
    stakingValidators,
    total,
    isFetching: isFetching || !cosmosQuery,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}
