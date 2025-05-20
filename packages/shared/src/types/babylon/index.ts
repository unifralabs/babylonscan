export enum StakingTransactionStakingStatusEnum {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  UNBONDED = 'UNBONDED',
  UNBONDING = 'UNBONDING',
  WITHDRAWN = 'WITHDRAWN',
  SLASHED = 'SLASHED',
}

export enum FinalityProvidersStatusEnum {
  CREATED = 'Created',
  ACTIVE = 'Active',
}

export enum FinalityProvidersSortTypeEnum {
  TOTAL_DELEGATIONS = 'total_sat',
  STAKERS_COUNT = 'stakers',
  DELEGATIONS_COUNT = 'delegations',
  COMMISSION = 'commission',
}

export enum BlockStatusEnum {
  PENDING = 0,
  FINALIZED = 1,
}

export const BlockStatusDict = {
  [BlockStatusEnum.PENDING]: 'Pending',
  [BlockStatusEnum.FINALIZED]: 'Finalized',
}

export enum CosmosBaseTransactionTypeEnum {
  MSG_SEND = 'MsgSend',
  MSG_ACKNOWLEDGEMENT = 'MsgAcknowledgement',
  MSG_BEGIN_REDELEGATE = 'MsgBeginRedelegate',
  MSG_CANCEL_UNBONDING_DELEGATION = 'MsgCancelUnbondingDelegation',
  MSG_CHANNEL_CLOSE_CONFIRM = 'MsgChannelCloseConfirm',
  MSG_CHANNEL_OPEN_CONFIRM = 'MsgChannelOpenConfirm',
  MSG_CHANNEL_OPEN_INIT = 'MsgChannelOpenInit',
  MSG_CHANNEL_OPEN_TRY = 'MsgChannelOpenTry',
  MSG_CONNECTION_OPEN_ACK = 'MsgConnectionOpenAck',
  MSG_CONNECTION_OPEN_CONFIRM = 'MsgConnectionOpenConfirm',
  MSG_CONNECTION_OPEN_INIT = 'MsgConnectionOpenInit',
  MSG_CONNECTION_OPEN_TRY = 'MsgConnectionOpenTry',
  MSG_CREATE_CLIENT = 'MsgCreateClient',
  MSG_DELEGATE = 'MsgDelegate',
  MSG_EDIT_VALIDATOR = 'MsgEditValidator',
  MSG_EXEC = 'MsgExec',
  MSG_FUND_COMMUNITY_POOL = 'MsgFundCommunityPool',
  MSG_GRANT = 'MsgGrant',
  MSG_MULTI_SEND = 'MsgMultiSend',
  MSG_RECV_PACKET = 'MsgRecvPacket',
  MSG_REVOKE = 'MsgRevoke',
  MSG_SET_WITHDRAW_ADDRESS = 'MsgSetWithdrawAddress',
  MSG_STORE_CODE = 'MsgStoreCode',
  MSG_SUBMIT_PROPOSAL = 'MsgSubmitProposal',
  MSG_TIMEOUT = 'MsgTimeout',
  MSG_TOKENIZE_SHARES = 'MsgTokenizeShares',
  MSG_TRANSFER = 'MsgTransfer',
  MSG_UNDELEGATE = 'MsgUndelegate',
  MSG_UNJAIL = 'MsgUnjail',
  MSG_UPDATE_ADMIN = 'MsgUpdateAdmin',
  MSG_UPDATE_CLIENT = 'MsgUpdateClient',
  MSG_VOTE = 'MsgVote',
  MSG_WITHDRAW_DELEGATOR_REWARD = 'MsgWithdrawDelegatorReward',
  MSG_WITHDRAW_REWARD = 'MsgWithdrawReward',
  MSG_WITHDRAW_VALIDATOR_COMMISSION = 'MsgWithdrawValidatorCommission',
  MSG_WRAPPED_BEGIN_REDELEGATE = 'MsgWrappedBeginRedelegate',
  MSG_WRAPPED_CANCEL_UNBONDING_DELEGATION = 'MsgWrappedCancelUnbondingDelegation',
  MSG_WRAPPED_CREATE_VALIDATOR = 'MsgWrappedCreateValidator',
  MSG_WRAPPED_DELEGATE = 'MsgWrappedDelegate',
  MSG_WRAPPED_UNDELEGATE = 'MsgWrappedUndelegate',
  MSG_EXECUTE_CONTRACT = 'MsgExecuteContract',
  MSG_INSTANTIATE_CONTRACT = 'MsgInstantiateContract',
  MSG_INSTANTIATE_CONTRACT2 = 'MsgInstantiateContract2',
  MSG_MIGRATE_CONTRACT = 'MsgMigrateContract',
}

export enum TransactionTypeEnum {
  // Cosmos related
  MSG_SEND = 'MsgSend',
  MSG_ACKNOWLEDGEMENT = 'MsgAcknowledgement',
  MSG_BEGIN_REDELEGATE = 'MsgBeginRedelegate',
  MSG_CANCEL_UNBONDING_DELEGATION = 'MsgCancelUnbondingDelegation',
  MSG_CHANNEL_CLOSE_CONFIRM = 'MsgChannelCloseConfirm',
  MSG_CHANNEL_OPEN_CONFIRM = 'MsgChannelOpenConfirm',
  MSG_CHANNEL_OPEN_INIT = 'MsgChannelOpenInit',
  MSG_CHANNEL_OPEN_TRY = 'MsgChannelOpenTry',
  MSG_CONNECTION_OPEN_ACK = 'MsgConnectionOpenAck',
  MSG_CONNECTION_OPEN_CONFIRM = 'MsgConnectionOpenConfirm',
  MSG_CONNECTION_OPEN_INIT = 'MsgConnectionOpenInit',
  MSG_CONNECTION_OPEN_TRY = 'MsgConnectionOpenTry',
  MSG_CREATE_CLIENT = 'MsgCreateClient',
  MSG_DELEGATE = 'MsgDelegate',
  MSG_EDIT_VALIDATOR = 'MsgEditValidator',
  MSG_EXEC = 'MsgExec',
  MSG_FUND_COMMUNITY_POOL = 'MsgFundCommunityPool',
  MSG_GRANT = 'MsgGrant',
  MSG_MULTI_SEND = 'MsgMultiSend',
  MSG_RECV_PACKET = 'MsgRecvPacket',
  MSG_REVOKE = 'MsgRevoke',
  MSG_SET_WITHDRAW_ADDRESS = 'MsgSetWithdrawAddress',
  MSG_STORE_CODE = 'MsgStoreCode',
  MSG_SUBMIT_PROPOSAL = 'MsgSubmitProposal',
  MSG_TIMEOUT = 'MsgTimeout',
  MSG_TOKENIZE_SHARES = 'MsgTokenizeShares',
  MSG_TRANSFER = 'MsgTransfer',
  MSG_UNDELEGATE = 'MsgUndelegate',
  MSG_UNJAIL = 'MsgUnjail',
  MSG_UPDATE_ADMIN = 'MsgUpdateAdmin',
  MSG_UPDATE_CLIENT = 'MsgUpdateClient',
  MSG_VOTE = 'MsgVote',
  MSG_WITHDRAW_DELEGATOR_REWARD = 'MsgWithdrawDelegatorReward',
  MSG_WITHDRAW_REWARD = 'MsgWithdrawReward',
  MSG_WITHDRAW_VALIDATOR_COMMISSION = 'MsgWithdrawValidatorCommission',
  MSG_WRAPPED_BEGIN_REDELEGATE = 'MsgWrappedBeginRedelegate',
  MSG_WRAPPED_CANCEL_UNBONDING_DELEGATION = 'MsgWrappedCancelUnbondingDelegation',
  MSG_WRAPPED_CREATE_VALIDATOR = 'MsgWrappedCreateValidator',
  MSG_WRAPPED_DELEGATE = 'MsgWrappedDelegate',
  MSG_WRAPPED_UNDELEGATE = 'MsgWrappedUndelegate',
  // Babylon related
  MSG_ADD_COVENANT_SIGS = 'MsgAddCovenantSigs',
  MSG_ADD_FINALITY_SIG = 'MsgAddFinalitySig',
  MSG_UNJAIL_FINALITY_PROVIDER = 'MsgUnjailFinalityProvider',
  MSG_RESUME_FINALITY_PROPOSAL = 'MsgResumeFinalityProposal',
  MSG_UPDATE_PARAMS = 'MsgUpdateParams',
  MSG_BTC_UNDELEGATE = 'MsgBTCUndelegate',
  MSG_COMMIT_PUB_RAND_LIST = 'MsgCommitPubRandList',
  MSG_CREATE_BTC_DELEGATION = 'MsgCreateBTCDelegation',
  MSG_CREATE_FINALITY_PROVIDER = 'MsgCreateFinalityProvider',
  MSG_EDIT_FINALITY_PROVIDER = 'MsgEditFinalityProvider',
  MSG_EXECUTE_CONTRACT = 'MsgExecuteContract',
  MSG_INJECTED_CHECKPOINT = 'MsgInjectedCheckpoint',
  MSG_INSERT_BTC_SPV_PROOF = 'MsgInsertBTCSpvProof',
  MSG_INSERT_HEADERS = 'MsgInsertHeaders',
  MSG_INSTANTIATE_CONTRACT = 'MsgInstantiateContract',
  MSG_INSTANTIATE_CONTRACT2 = 'MsgInstantiateContract2',
  MSG_MIGRATE_CONTRACT = 'MsgMigrateContract',
  MSG_SELECTIVE_SLASHING_EVIDENCE = 'MsgSelectiveSlashingEvidence',
}

export const TransactionStakingTypes = [
  TransactionTypeEnum.MSG_ADD_COVENANT_SIGS,
  TransactionTypeEnum.MSG_ADD_FINALITY_SIG,
  TransactionTypeEnum.MSG_UNJAIL_FINALITY_PROVIDER,
  TransactionTypeEnum.MSG_RESUME_FINALITY_PROPOSAL,
  TransactionTypeEnum.MSG_BTC_UNDELEGATE,
  TransactionTypeEnum.MSG_COMMIT_PUB_RAND_LIST,
  TransactionTypeEnum.MSG_CREATE_BTC_DELEGATION,
  TransactionTypeEnum.MSG_CREATE_FINALITY_PROVIDER,
  TransactionTypeEnum.MSG_EDIT_FINALITY_PROVIDER,
  TransactionTypeEnum.MSG_SELECTIVE_SLASHING_EVIDENCE,
]

export enum ValidatorStatusEnum {
  BOND_STATUS_UNSPECIFIED = 'BOND_STATUS_UNSPECIFIED',
  BOND_STATUS_UNBONDED = 'BOND_STATUS_UNBONDED',
  BOND_STATUS_UNBONDING = 'BOND_STATUS_UNBONDING',
  BOND_STATUS_BONDED = 'BOND_STATUS_BONDED',
}

export enum ValidatorsSortTypeEnum {
  COMMISSION = 'commission',
  VOTING_POWER = 'voting_power',
}

export enum TokenTrackerTypeEnum {
  TRENDING = 'NATIVE',
  // LIQUID_STAKING = 'liquid_staking',
  IBC = 'IBC',
  // BRIDGED = 'bridged',
}

export const TokenTrackerTypeDict = {
  [TokenTrackerTypeEnum.TRENDING]: 'trending',
  // [TokenTrackerTypeEnum.LIQUID_STAKING]: 'liquidStakingAssets',
  [TokenTrackerTypeEnum.IBC]: 'ibcTokens',
  // [TokenTrackerTypeEnum.BRIDGED]: 'bridgedTokens',
}

export enum TokenTrackerSortTypeEnum {
  PRICE = 'price',
  CHANGE = 'price_change_percentage_24h',
  MARKET_CAP = 'market_cap',
  CIRCULATING_MARKET_CAP = 'circulating_market_cap',
  VOLUME_24H = 'volume_24h',
  TOTAL_SUPPLY = 'total_supply',
  CIRCULATING_SUPPLY = 'circulating_supply',
  // HOLDERS = 'holders',
}

export enum TokenTopHoldersSortTypeEnum {
  BALANCE = 'balance',
}

export enum CodeProjectTypeEnum {
  WORKSPACE = 'workspace',
  CONTRACT = 'contract',
}

export type VerificationSettings = {
  project_type: CodeProjectTypeEnum
  optimizer_version: string
  git: string
  branch: string
}

// status enum
export const VerifyStatus = {
  Pending: 1,
  Pass: 2,
  Fail: 3,
} as const

export type CosmWasmVerifyInputParams = {
  source_url: string
  builder_image: string
  expected_checksum: string
}

export const CosmWasmOptimizerImageDict = {
  [CodeProjectTypeEnum.WORKSPACE]: 'cosmwasm/workspace-optimizer',
  [CodeProjectTypeEnum.CONTRACT]: 'cosmwasm/rust-optimizer',
}

export enum ContractsListTypeEnum {
  ALL = 'ALL',
}

export const ContractsListTypeDict = {
  [ContractsListTypeEnum.ALL]: 'all',
}

export enum ContractsListSortTypeEnum {
  CREATION_HEIGHT = 'creation_height',
  CREATION_TIMESTAMP = 'creation_timestamp',
}

export enum AddressPortfolioSortTypeEnum {
  BALANCE = 'balance',
}

export enum VoteEnum {
  UNSPECIFIED = 0,
  YES = 1,
  ABSTAIN = 2,
  NO = 3,
  VETO = 4,
  DIDNOTVOTE = 5,
}

export const VoteDict = {
  [VoteEnum.UNSPECIFIED]: 'UNSPECIFIED',
  [VoteEnum.YES]: 'YES',
  [VoteEnum.ABSTAIN]: 'ABSTAIN',
  [VoteEnum.NO]: 'NO',
  [VoteEnum.VETO]: 'VETO',
  [VoteEnum.DIDNOTVOTE]: 'DID NOT VOTE',
}

export enum VoteStatusEnum {
  UNSPECIFIED = 'PROPOSAL_STATUS_UNSPECIFIED',
  PASSED = 'PROPOSAL_STATUS_PASSED',
  REJECTED = 'PROPOSAL_STATUS_REJECTED',
  DEPOSIT_PERIOD = 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
  VOTING_PERIOD = 'PROPOSAL_STATUS_VOTING_PERIOD',
  FAILED = 'PROPOSAL_STATUS_FAILED',
}

export const VoteStatusDict = {
  [VoteStatusEnum.UNSPECIFIED]: 'UNSPECIFIED',
  [VoteStatusEnum.PASSED]: 'PASSED',
  [VoteStatusEnum.REJECTED]: 'REJECTED',
  [VoteStatusEnum.DEPOSIT_PERIOD]: 'DEPOSIT PERIOD',
  [VoteStatusEnum.VOTING_PERIOD]: 'VOTING PERIOD',
  [VoteStatusEnum.FAILED]: 'FAILED',
}

export enum EpochStatusEnum {
  ACCUMULATING = 0,
  SEALED = 1,
  SUBMITTED = 2,
  CONFIRMED = 3,
  FINALIZED = 4,
}

export const EpochStatusDict = {
  [EpochStatusEnum.ACCUMULATING]: 'Accumulating',
  [EpochStatusEnum.SEALED]: 'Sealed',
  [EpochStatusEnum.SUBMITTED]: 'Submitted',
  [EpochStatusEnum.CONFIRMED]: 'Confirmed',
  [EpochStatusEnum.FINALIZED]: 'Finalized',
}

export * from './wallet'
