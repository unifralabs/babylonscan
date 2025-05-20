import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalTransactionRouterInputs =
  InternalRouterInputs['transaction']

export type InternalTransactionRouterOutputs =
  InternalRouterOutputs['transaction']

// Transactions
export type TransactionListInput =
  InternalTransactionRouterInputs['fetchInfiniteTransactions']

export type TransactionList =
  InternalTransactionRouterOutputs['fetchInfiniteTransactions']['items']

export type TransactionListItem = TransactionList[number]
