import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalContractRouterInputs = InternalRouterInputs['contract']

export type InternalContractRouterOutputs = InternalRouterOutputs['contract']

// Contract List
export type ContractsListInput =
  InternalContractRouterInputs['fetchInfiniteContracts']

export type ContractsList =
  InternalContractRouterOutputs['fetchInfiniteContracts']['items']

export type ContractsListItem = ContractsList[number]

// Contract Detail
export type ContractDetail = NonNullable<
  InternalContractRouterOutputs['fetchContractDetail']
>
