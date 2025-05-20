import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalUtilRouterInputs = InternalRouterInputs['util']

export type InternalUtilRouterOutputs = InternalRouterOutputs['util']

// Consumer Chains
export type UtilConsumerChainsInput =
  InternalUtilRouterInputs['fetchInfiniteConsumerChains']

export type UtilConsumerChains =
  InternalUtilRouterOutputs['fetchInfiniteConsumerChains']['items']

export type UtilConsumerChainsItem = UtilConsumerChains[number]
