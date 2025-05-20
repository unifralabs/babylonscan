import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalStakingRouterInputs = InternalRouterInputs['staking']

export type InternalStakingRouterOutputs = InternalRouterOutputs['staking']

// Staking Transactions List
export type StakingTransactionsInput =
  InternalStakingRouterInputs['fetchInfiniteStakingTransactions']

export type StakingTransactions =
  InternalStakingRouterOutputs['fetchInfiniteStakingTransactions']['items']

export type StakingTransactionsItem = StakingTransactions[number]

export type StakingTransactionTxStatus = 'SUCCESS' | 'FAILURE'

// Address Staking Transactions
export type AddressStakingTransactionsInput =
  InternalStakingRouterInputs['fetchInfiniteStakingTransactionsByAddress']

export type AddressStakingTransactions =
  InternalStakingRouterOutputs['fetchInfiniteStakingTransactionsByAddress']['items']

export type AddressStakingTransactionsItem = AddressStakingTransactions[number]
