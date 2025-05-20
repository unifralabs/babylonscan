import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalValidatorRouterInputs = InternalRouterInputs['validator']

export type InternalValidatorRouterOutputs = InternalRouterOutputs['validator']

// Validators List
export type ValidatorListInput =
  InternalValidatorRouterInputs['fetchInfiniteValidators']

export type ValidatorList =
  InternalValidatorRouterOutputs['fetchInfiniteValidators']['items']

export type ValidatorListItem = ValidatorList[number]

// Validators Detail
export type ValidatorDetail = NonNullable<
  InternalValidatorRouterOutputs['fetchValidatorDetail']
>

// Validator Delegators List
export type ValidatorDelegatorsListInput =
  InternalValidatorRouterInputs['fetchValidatorDelegators']

export type ValidatorDelegatorsList =
  InternalValidatorRouterOutputs['fetchValidatorDelegators']['items']

export type ValidatorDelegatorsListItem = ValidatorDelegatorsList[number]

// Validator Votes List
export type ValidatorVotesListInput =
  InternalValidatorRouterInputs['fetchValidatorVotes']

export type ValidatorVotesList =
  InternalValidatorRouterOutputs['fetchValidatorVotes']['items']

export type ValidatorVotesListItem = ValidatorVotesList[number]

// Validator Votes List
export type ValidatorPowerEventsListInput =
  InternalValidatorRouterInputs['fetchValidatorPowerEvents']

export type ValidatorPowerEventsList =
  InternalValidatorRouterOutputs['fetchValidatorPowerEvents']['items']

export type ValidatorPowerEventsListItem = ValidatorPowerEventsList[number]

// Validator Proposed Blocks List
export type ValidatorProposedBlocksListInput =
  InternalValidatorRouterInputs['fetchValidatorProposedBlocks']

export type ValidatorProposedBlocksList =
  InternalValidatorRouterOutputs['fetchValidatorProposedBlocks']['items']

export type ValidatorProposedBlocksListItem = ValidatorProposedBlocksList[number]
