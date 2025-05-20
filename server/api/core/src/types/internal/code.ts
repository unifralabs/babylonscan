import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalCodeRouterInputs = InternalRouterInputs['code']

export type InternalCodeRouterOutputs = InternalRouterOutputs['code']

export type CodeContractsListInput =
  InternalCodeRouterInputs['fetchInfiniteCodeContracts']

export type CodeContractsList =
  InternalCodeRouterOutputs['fetchInfiniteCodeContracts']['items']

export type CodeContractsListItem = CodeContractsList[number]

export type CodeDetail = InternalCodeRouterOutputs['fetchCodeDetail']
