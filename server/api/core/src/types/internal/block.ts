import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalBlockRouterInputs = InternalRouterInputs['block']

export type InternalBlockRouterOutputs = InternalRouterOutputs['block']

// Block List
export type BlockListInput = InternalBlockRouterInputs['fetchInfiniteBlocks']

export type BlockList =
  InternalBlockRouterOutputs['fetchInfiniteBlocks']['items']

export type BlockListItem = BlockList[number] & {
  proposer_name?: string | null
}

// Block Detail
export type BlockDetail = NonNullable<
  InternalBlockRouterOutputs['fetchBlockDetail']
>
