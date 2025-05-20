import { useCallback, useMemo } from 'react'

import { useCosmosQueryContext } from '../../providers/cosmos'
import { clientApi } from '../../trpc/react'
import { useChain } from '@cosmos-kit/react'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'

import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { formatNumWithCommas, formatUnits } from '@cosmoscan/shared/utils'

/*
 * If used in shadcn dialog (connect / openView)
 * add removeScroll={false} and isDismissDisabled={true} props in DialogContent to  enable wallet dialog scrolling
 */

export default function useCosmos(
  chainName = CURRENT_CHAIN.cosmosChainInfo.chainName,
) {
  const {
    status,
    username,
    address,
    message,
    connect,
    isWalletConnecting,
    disconnect,
    openView,
    isWalletConnected,
    getSigningStargateClient,
    estimateFee,
    getRpcEndpoint,
  } = useChain(chainName)

  const nativeToken = CURRENT_CHAIN.cosmosChainInfo.assets.assets[0]
  const nativeTokenDecimals =
    nativeToken.denom_units.find(unit => unit.denom === nativeToken.display)
      ?.exponent ?? CURRENT_CHAIN.nativeToken.decimals

  return {
    chainName,
    status,
    username,
    address,
    message,
    connect,
    isWalletConnecting,
    disconnect,
    openView,
    isWalletConnected,
    getSigningStargateClient,
    estimateFee,
    nativeToken,
    nativeTokenDecimals,
    getRpcEndpoint,
  }
}

export function useCosmosNativeTokenPrice() {
  const {
    data: nativeTokenPrice,
    isFetching,
    refetch,
  } = clientApi.public.fetchTokenUSDPriceBySymbol.useQuery(
    CURRENT_CHAIN.nativeToken.symbol,
    {
      refetchInterval: 1000 * 60,
      staleTime: Infinity,
    },
  )

  return { nativeTokenPrice: nativeTokenPrice ?? '0', isFetching, refetch }
}

export function getCosmosBalanceQueryKey(address?: string, tokenSymbol = '') {
  return ['cosmos-balance', address, tokenSymbol]
}

export function useCosmosBalance() {
  const { address, nativeToken } = useCosmos()
  const { cosmosQuery } = useCosmosQueryContext()
  const {
    nativeTokenPrice,
    isFetching: btcPriceIsFetching,
    refetch: btcPriceRefetch,
  } = useCosmosNativeTokenPrice()

  const {
    data: balance,
    isFetching: cosmosBalanceIsFetching,
    refetch: cosmosBalanceRefetch,
  } = useQuery({
    queryKey: getCosmosBalanceQueryKey(address, nativeToken?.base),
    queryFn: () =>
      cosmosQuery?.bank.v1beta1.balance({
        address: address!,
        denom: nativeToken?.base,
      }),
    enabled: !!cosmosQuery && !!address && !!nativeToken?.base,
    refetchInterval: 1000 * 60,
    staleTime: Infinity,
    select(data) {
      return Number(data?.balance?.amount ?? 0)
    },
  })

  const formattedBalance = useMemo(
    () =>
      formatUnits(BigInt(balance ?? 0n), CURRENT_CHAIN.nativeToken.decimals),
    [balance],
  )

  const formattedUSDBalance = useMemo(
    () =>
      BigNumber(
        formatUnits(BigInt(balance ?? 0n), CURRENT_CHAIN.nativeToken.decimals),
      )
        .multipliedBy(nativeTokenPrice)
        .toFixed(2),
    [balance, nativeTokenPrice],
  )

  const displayedBalance = useMemo(
    () =>
      `${formatNumWithCommas(formattedBalance)} ${
        CURRENT_CHAIN.nativeToken.symbol
      }`,
    [formattedBalance],
  )

  const displayedUSDBalance = useMemo(
    () => `$${formatNumWithCommas(formattedUSDBalance)}`,
    [formattedUSDBalance],
  )

  const isFetching = useMemo(
    () => cosmosBalanceIsFetching || btcPriceIsFetching,
    [btcPriceIsFetching, cosmosBalanceIsFetching],
  )

  const refetch = useCallback(() => {
    cosmosBalanceRefetch()
    btcPriceRefetch()
  }, [btcPriceRefetch, cosmosBalanceRefetch])

  return {
    balance,
    formattedBalance,
    formattedUSDBalance,
    displayedBalance,
    displayedUSDBalance,
    isFetching: isFetching || !cosmosQuery,
    refetch,
  }
}
