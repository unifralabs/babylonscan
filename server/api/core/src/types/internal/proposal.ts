import { InternalRouterInputs, InternalRouterOutputs } from '../root'

export type InternalProposalRouterInputs = InternalRouterInputs['proposal']

export type InternalProposalRouterOutputs = InternalRouterOutputs['proposal']

// Proposal List
export type ProposalListInput =
  InternalProposalRouterInputs['fetchInfiniteProposals']

export type ProposalList =
  InternalProposalRouterOutputs['fetchInfiniteProposals']['items']

export type ProposalListItem = ProposalList[number]

// Proposal Detail
export type ProposalDetail =
  InternalProposalRouterOutputs['fetchProposalDetail']

// Proposal Deposits
export type ProposalDeposits =
  InternalProposalRouterOutputs['fetchProposalDeposits']

export type ProposalDepositsItem = ProposalDeposits[number]
