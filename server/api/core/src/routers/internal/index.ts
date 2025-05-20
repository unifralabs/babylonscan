import { createTRPCRouter } from '../../trpc'
import { addressRouter } from './address'
import { blockRouter } from './block'
import { codeRouter } from './code'
import { contractRouter } from './contract'
import { finalityProviderRouter } from './finality-provider'
import { parametersRouter } from './parameters'
import { proposalRouter } from './proposal'
import { stakingRouter } from './staking'
import { statRouter } from './stat'
import { tokenRouter } from './token'
import { transactionRouter } from './transaction'
import { utilRouter } from './util'
import { validatorRouter } from './validator/index'

export const internalRouter = createTRPCRouter({
  address: addressRouter,
  block: blockRouter,
  code: codeRouter,
  contract: contractRouter,
  finalityProvider: finalityProviderRouter,
  parameters: parametersRouter,
  proposal: proposalRouter,
  staking: stakingRouter,
  stat: statRouter,
  token: tokenRouter,
  transaction: transactionRouter,
  util: utilRouter,
  validator: validatorRouter,
})
