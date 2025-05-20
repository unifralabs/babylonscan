import { useCallback, useEffect, useMemo, useState } from 'react'

import useCosmos, { getCosmosBalanceQueryKey } from '.'
import {
  BABYLON_WRAPPED_MSG,
  MsgBabylonDelegate,
  MsgBabylonRedelegate,
  MsgBabylonUndelegate,
} from '../../constants/babylon-cosmos-tx'
import { useCosmosQueryContext } from '../../providers/cosmos'
import useCosmosTx, { catchCosmosTxError } from './tx'
import { getCosmosStakingValidatorsQueryKey } from './validator'
import { type StdFee } from '@cosmjs/stargate'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  type QueryFunctionContext,
} from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { cosmos, EncodeObject } from 'interchain-query'
import { QueryDelegatorDelegationsResponse } from 'interchain-query/cosmos/staking/v1beta1/query'
import { useToggle } from 'react-use'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { formatUnits } from '@cosmoscan/shared/utils'

const MessageComposer = cosmos.staking.v1beta1.MessageComposer

function getStakeMsg({
  delegatorAddress,
  validatorAddress,
  amount,
  denom,
}: {
  delegatorAddress: string
  validatorAddress: string
  amount: string
  denom: string
}) {
  const params = {
    delegatorAddress,
    validatorAddress,
    amount: {
      amount,
      denom,
    },
  }

  return CURRENT_CHAIN.isBabylon
    ? {
        typeUrl: BABYLON_WRAPPED_MSG.delegate,
        value: MsgBabylonDelegate.fromPartial({
          msg: params,
        }),
      }
    : MessageComposer.fromPartial.delegate(params)
}

function getRestakeMsg({
  delegatorAddress,
  validatorSrcAddress,
  validatorDstAddress,
  amount,
  denom,
}: {
  delegatorAddress: string
  validatorSrcAddress: string
  validatorDstAddress: string
  amount: string
  denom: string
}) {
  const params = {
    delegatorAddress,
    validatorSrcAddress,
    validatorDstAddress,
    amount: {
      amount,
      denom,
    },
  }

  return CURRENT_CHAIN.isBabylon
    ? {
        typeUrl: BABYLON_WRAPPED_MSG.beginRedelegate,
        value: MsgBabylonRedelegate.fromPartial({
          msg: params,
        }),
      }
    : MessageComposer.fromPartial.beginRedelegate(params)
}

function getUnstakeMsg({
  delegatorAddress,
  validatorAddress,
  amount,
  denom,
}: {
  delegatorAddress: string
  validatorAddress: string
  amount: string
  denom: string
}) {
  const params = {
    delegatorAddress,
    validatorAddress,
    amount: {
      amount,
      denom,
    },
  }

  return CURRENT_CHAIN.isBabylon
    ? {
        typeUrl: BABYLON_WRAPPED_MSG.undelegate,
        value: MsgBabylonUndelegate.fromPartial({
          msg: params,
        }),
      }
    : MessageComposer.fromPartial.undelegate(params)
}

export function useCosmosStakeFee(
  {
    type,
    validatorAddress,
    validatorDstAddress,
    amount,
  }: {
    type?: 'stake' | 'restake' | 'unstake'
    validatorAddress?: string
    validatorDstAddress?: string
    amount?: string
  } = {
    type: 'stake',
    validatorAddress: '',
    amount: '',
  },
) {
  const { address, nativeToken, nativeTokenDecimals, estimateFee } = useCosmos()

  const [fee, setFee] = useState<{
    fee: StdFee
    feeAmount: string
    formattedFee: string
  }>()
  const [isFetchingFee, toggleIsFetchingFee] = useToggle(false)

  const onFetchFee = useCallback(
    async ({
      validatorAddress: __validatorAddress,
      validatorDstAddress: __validatorDstAddress,
      amount: __amount,
      type: __type,
    }: {
      validatorAddress?: string
      validatorDstAddress?: string
      amount?: string
      type?: 'stake' | 'restake' | 'unstake'
    } = {}) => {
      const currentValidatorAddress = __validatorAddress || validatorAddress
      const currentValidatorDstAddress =
        __validatorDstAddress || validatorDstAddress
      const currentAmount = __amount || amount
      const currentType = __type || type || 'stake'

      if (
        !estimateFee ||
        !address ||
        !currentValidatorAddress ||
        !currentAmount ||
        BigNumber(currentAmount ?? 0).isZero()
      )
        return
      try {
        toggleIsFetchingFee(true)
        let msg: EncodeObject
        if (['stake', 'unstake'].includes(currentType)) {
          msg = (currentType === 'stake' ? getStakeMsg : getUnstakeMsg)({
            delegatorAddress: address,
            validatorAddress: currentValidatorAddress,
            amount: currentAmount,
            denom: nativeToken.base,
          })
        } else {
          msg = getRestakeMsg({
            delegatorAddress: address,
            validatorSrcAddress: currentValidatorAddress,
            validatorDstAddress: currentValidatorDstAddress!,
            amount: currentAmount,
            denom: nativeToken.base,
          })
        }

        const result = await estimateFee([msg])
        const feeAmount = result.amount[0]?.amount ?? ''
        const formattedFee = formatUnits(
          BigInt(feeAmount),
          nativeTokenDecimals,
        ).toString()
        const data = { fee: result, feeAmount, formattedFee }
        setFee(data)
        return data
      } catch (error) {
        console.error(error)
      } finally {
        toggleIsFetchingFee(false)
      }
    },
    [
      address,
      amount,
      estimateFee,
      nativeToken.base,
      nativeTokenDecimals,
      toggleIsFetchingFee,
      type,
      validatorAddress,
      validatorDstAddress,
    ],
  )

  useEffect(() => {
    onFetchFee()
  }, [onFetchFee])

  return { fee, onFetchFee, isFetchingFee }
}

export function useCosmosStake() {
  const queryClient = useQueryClient()
  const { address, isWalletConnected, connect, nativeToken } = useCosmos()
  const { tx } = useCosmosTx()
  const { onFetchFee } = useCosmosStakeFee()

  const [isStaking, toggleIsStaking] = useToggle(false)

  const onStake = useCallback(
    async ({
      validatorAddress,
      amount,
      cb,
    }: {
      validatorAddress: string
      amount: string
      cb?: () => void
    }) => {
      if (!isWalletConnected) {
        connect()
        return
      }

      if (!address) return

      const msg = getStakeMsg({
        delegatorAddress: address,
        validatorAddress,
        amount,
        denom: nativeToken.base,
      })

      const data = await onFetchFee({ validatorAddress, amount })

      try {
        toggleIsStaking(true)
        await tx([msg], { fee: data?.fee })
        queryClient.invalidateQueries({
          queryKey: getCosmosBalanceQueryKey(address, nativeToken?.base),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingDelegationsQueryKey(address),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingValidatorsQueryKey(address),
        })
        cb?.()
      } catch (error) {
        catchCosmosTxError(error)
      } finally {
        toggleIsStaking(false)
      }
    },
    [
      isWalletConnected,
      address,
      nativeToken.base,
      onFetchFee,
      connect,
      toggleIsStaking,
      tx,
      queryClient,
    ],
  )

  return { onStake, isStaking }
}

export function useCosmosUnstake() {
  const queryClient = useQueryClient()
  const { address, isWalletConnected, connect, nativeToken } = useCosmos()
  const { tx } = useCosmosTx()
  const { onFetchFee } = useCosmosStakeFee()

  const [isUnstaking, toggleIsUnstaking] = useToggle(false)

  const onUnstake = useCallback(
    async ({
      validatorAddress,
      amount,
      cb,
    }: {
      validatorAddress: string
      amount: string
      cb?: () => void
    }) => {
      if (!isWalletConnected) {
        connect()
        return
      }

      if (!address) return

      const msg = getUnstakeMsg({
        delegatorAddress: address,
        validatorAddress,
        amount,
        denom: nativeToken.base,
      })

      const data = await onFetchFee({
        validatorAddress,
        amount,
        type: 'unstake',
      })

      try {
        toggleIsUnstaking(true)
        await tx([msg], { fee: data?.fee })
        queryClient.invalidateQueries({
          queryKey: getCosmosBalanceQueryKey(address, nativeToken?.base),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingDelegationsQueryKey(address),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingValidatorsQueryKey(address),
        })
        cb?.()
      } catch (error) {
        catchCosmosTxError(error)
      } finally {
        toggleIsUnstaking(false)
      }
    },
    [
      isWalletConnected,
      address,
      nativeToken.base,
      onFetchFee,
      connect,
      toggleIsUnstaking,
      tx,
      queryClient,
    ],
  )

  return { onUnstake, isUnstaking }
}

export function useCosmosRestake() {
  const queryClient = useQueryClient()
  const { address, isWalletConnected, connect, nativeToken } = useCosmos()
  const { tx } = useCosmosTx()
  const { onFetchFee } = useCosmosStakeFee()

  const [isRestaking, toggleIsRestaking] = useToggle(false)

  const onRestake = useCallback(
    async ({
      validatorAddress,
      validatorDstAddress,
      amount,
      cb,
    }: {
      validatorAddress: string
      validatorDstAddress: string
      amount: string
      cb?: () => void
    }) => {
      if (!isWalletConnected) {
        connect()
        return
      }

      if (!address) return

      const msg = getRestakeMsg({
        delegatorAddress: address,
        validatorSrcAddress: validatorAddress,
        validatorDstAddress,
        amount,
        denom: nativeToken.base,
      })

      const data = await onFetchFee({
        validatorAddress,
        validatorDstAddress,
        amount,
        type: 'restake',
      })

      try {
        toggleIsRestaking(true)
        await tx([msg], { fee: data?.fee })
        queryClient.invalidateQueries({
          queryKey: getCosmosBalanceQueryKey(address, nativeToken?.base),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingDelegationsQueryKey(address),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingValidatorsQueryKey(address),
        })
        cb?.()
      } catch (error) {
        catchCosmosTxError(error)
      } finally {
        toggleIsRestaking(false)
      }
    },
    [
      isWalletConnected,
      address,
      nativeToken.base,
      onFetchFee,
      connect,
      toggleIsRestaking,
      tx,
      queryClient,
    ],
  )

  return { onRestake, isRestaking }
}

export function useCosmosClaimRewards(address?: string) {
  const queryClient = useQueryClient()
  const {
    address: walletAddress,
    isWalletConnected,
    connect,
    nativeToken,
  } = useCosmos()
  const { tx } = useCosmosTx()
  const { rewards } = useCosmosStakingRewards(address)

  const [isClaiming, toggleIsClaiming] = useToggle(false)

  const onClaimTotalReward = useCallback(
    async ({ cb }: { cb?: () => void } = {}) => {
      if (!isWalletConnected) {
        connect()
        return
      }

      const delegatorAddress = address || walletAddress

      if (!!!rewards?.length || !delegatorAddress) return

      const { withdrawDelegatorReward } =
        cosmos.distribution.v1beta1.MessageComposer.fromPartial
      const msgs = rewards.map(({ validatorAddress }) =>
        withdrawDelegatorReward({
          delegatorAddress,
          validatorAddress,
        }),
      )

      try {
        toggleIsClaiming(true)
        await tx(msgs)
        queryClient.invalidateQueries({
          queryKey: getCosmosBalanceQueryKey(
            delegatorAddress,
            nativeToken?.base,
          ),
        })
        queryClient.invalidateQueries({
          queryKey: getCosmosStakingRewardsQueryKey(delegatorAddress),
        })
        cb?.()
      } catch (error) {
        catchCosmosTxError(error)
      } finally {
        toggleIsClaiming(false)
      }
    },
    [
      isWalletConnected,
      address,
      walletAddress,
      rewards,
      connect,
      toggleIsClaiming,
      tx,
      queryClient,
      nativeToken?.base,
    ],
  )

  return { onClaimTotalReward, isClaiming }
}

export function getCosmosStakingDelegationsQueryKey(address?: string) {
  return ['cosmos-staking-delegations', address]
}

export function useCosmosStakingDelegations() {
  const { address } = useCosmos()
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: getCosmosStakingDelegationsQueryKey(address),
      initialPageParam: undefined,
      queryFn: (data =>
        cosmosQuery?.staking.v1beta1.delegatorDelegations({
          delegatorAddr: address!,
          pagination: {
            key: (data?.pageParam || new Uint8Array()) as Uint8Array,
            offset: 0n,
            limit: 200n,
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
      staleTime: Infinity,
    })

  const stakingDelegations = useMemo(
    () => data?.pages?.flatMap(page => page?.delegationResponses) || [],
    [data?.pages],
  )

  const total = useMemo(
    () => Number(data?.pages?.[0]?.pagination?.total ?? 0),
    [data?.pages],
  )

  return {
    stakingDelegations,
    total,
    isFetching: isFetching || !cosmosQuery,
    hasNextPage,
    fetchNextPage,
    refetch,
  }
}

export function getCosmosStakingRewardsQueryKey(address?: string) {
  return ['cosmos-staking-rewards', address]
}

export function useCosmosStakingRewards(address?: string) {
  const {
    address: walletAddress,
    nativeToken,
    nativeTokenDecimals,
  } = useCosmos()
  const { cosmosQuery } = useCosmosQueryContext()

  const { data, isFetching, refetch } = useQuery({
    queryKey: getCosmosStakingRewardsQueryKey(address || walletAddress),
    queryFn: () =>
      cosmosQuery?.distribution.v1beta1.delegationTotalRewards({
        delegatorAddress: address!,
      }),
    enabled: !!cosmosQuery && !!(address || walletAddress),
    staleTime: Infinity,
    refetchInterval: 1000 * 60,
  })

  const totalReward = useMemo(
    () =>
      (
        data?.total?.find(({ denom }) => denom === nativeToken?.base)?.amount ??
        '0'
      )?.split('.')?.[0],
    [data?.total, nativeToken?.base],
  )

  const formattedTotalReward = useMemo(
    () => formatUnits(BigInt(totalReward), nativeTokenDecimals),
    [nativeTokenDecimals, totalReward],
  )

  const rewards = useMemo(
    () =>
      data?.rewards?.map(({ validatorAddress, reward }) => {
        const _reward = (
          reward?.find(({ denom }) => denom === nativeToken?.base)?.amount ??
          '0'
        )?.split('.')?.[0]

        return {
          validatorAddress,
          reward: _reward,
          formattedReward: formatUnits(BigInt(_reward), nativeTokenDecimals),
        }
      }),
    [data?.rewards, nativeToken?.base, nativeTokenDecimals],
  )

  return {
    rewards,
    totalReward,
    formattedTotalReward,
    isFetching: isFetching || !cosmosQuery,
    refetch,
  }
}
