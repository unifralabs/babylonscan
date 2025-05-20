import { getTokensByDenoms } from './token'

import Prisma from '@cosmoscan/core-db'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
  AddressPortfolioSortTypeEnum,
  StakingTransactionStakingStatusEnum,
} from '@cosmoscan/shared/types'
import { cosmos } from 'interchain-query'
import { bech32 } from 'bech32'

// Convert normal address to validator operator address
function getValidatorAddress(address: string): string {
  try {
    const decoded = bech32.decode(address)
    // For Babylon chain, validator operator prefix is "bbnvaloper"
    const reencoded = bech32.encode(
      'bbnvaloper',
      decoded.words
    )
    return reencoded
  } catch {
    return ''
  }
}

export async function getAddressNativeBalance(
  db: typeof Prisma,
  address: string,
) {
  const data = await db.coin_balance.findUnique({
    where: {
      address_denom: {
        address,
        denom: CURRENT_CHAIN.nativeToken.denom,
      },
    },
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  })

  return Number(data?.balance ?? 0)
}

export async function getAddressTokensBalance(
  db: typeof Prisma,
  {
    address,
    take = CONSTANT.tableDefaultPageSize,
    skip = 0,
    sort = AddressPortfolioSortTypeEnum.BALANCE,
    desc = true,
  }: {
    address: string
    take: number
    skip?: number
    sort?: AddressPortfolioSortTypeEnum
    desc?: boolean
  },
) {
  const items = await db.coin_balance.findMany({
    take: take + 1,
    skip,
    where: {
      address,
    },
    orderBy: [{ [sort]: desc ? 'desc' : 'asc' }, { denom: 'asc' }],
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  })

  let nextCursor: { take: number; skip: number } | undefined = undefined
  if (items.length > take) {
    items.pop()
    nextCursor = { take, skip: skip + take }
  }

  const tokens = await getTokensByDenoms(
    db,
    items.map(item => item.denom),
  )

  return {
    items: items.map(item => ({
      ...item,
      ...tokens?.find(({ denom }) => denom === item.denom),
    })),
    nextCursor,
  }
}

export async function getAddressDelegatedBTCBalance(
  db: typeof Prisma,
  {
    btcAddress,
    stakingStatus,
  }: {
    btcAddress?: string | null
    stakingStatus?: StakingTransactionStakingStatusEnum[]
  },
) {
  return !!!btcAddress
    ? 0
    : Number(
        (
          await db.finality_providers_delegations.aggregate({
            _sum: {
              total_sat: true,
            },
            where: {
              btc_address: btcAddress,
              status_desc: {
                in: !!stakingStatus?.length ? stakingStatus : undefined,
              },
            },
          })
        )?._sum?.total_sat ?? 0,
      )
}

export async function getAddressAssetStats(
  db: typeof Prisma,
  address: string,
) {
  const client = await cosmos.ClientFactory.createRPCQueryClient({
    rpcEndpoint: CURRENT_CHAIN.cosmosChainInfo.chain.apis?.rpc?.[0].address ?? '',
  })
  
  // Query available balance
  const balanceResponse = await client.cosmos.bank.v1beta1.balance({
    address,
    denom: CURRENT_CHAIN.nativeToken.denom,
  })
  const available = Number(balanceResponse.balance?.amount ?? 0)

  // Query vesting account info
  let delegatableVesting = 0
  try {
    const accountResponse = await client.cosmos.auth.v1beta1.account({
      address,
    })
    
    if (accountResponse.account && '$typeUrl' in accountResponse.account && 
      accountResponse.account.$typeUrl === '/cosmos.vesting.v1beta1.ContinuousVestingAccount') {
      // For vesting accounts, we need to calculate the delegatable amount based on the vesting schedule
      const vestingAccount = accountResponse.account
      if ('start_time' in vestingAccount && 'end_time' in vestingAccount && 'original_vesting' in vestingAccount) {
        const now = Date.now()
        const startTime = Number(vestingAccount.start_time) * 1000
        const endTime = Number(vestingAccount.end_time) * 1000
        if (now >= startTime && now <= endTime) {
          const vestingCoins = Array.isArray(vestingAccount.original_vesting) ? vestingAccount.original_vesting : []
          const originalVesting = Number(vestingCoins[0]?.amount ?? 0)
          const elapsed = now - startTime
          const total = endTime - startTime
          delegatableVesting = (originalVesting * elapsed) / total
        }
      }
    }
  } catch (error) {
    // Account doesn't exist or other error occurred
    console.error('Failed to fetch account info:', error)
  }

  // Query delegations
  const delegationsResponse = await client.cosmos.staking.v1beta1.delegatorDelegations({
    delegatorAddr: address,
  })
  const delegated = delegationsResponse.delegationResponses.reduce(
    (sum: number, delegation: { balance?: { amount?: string } }) => 
      sum + Number(delegation.balance?.amount ?? 0),
    0,
  )

  // Query unbonding delegations
  const unbondingResponse = await client.cosmos.staking.v1beta1.delegatorUnbondingDelegations({
    delegatorAddr: address,
  })
  const unbonding = unbondingResponse.unbondingResponses.reduce(
    (sum: number, unbonding: { entries: Array<{ balance?: string }> }) =>
      sum +
      unbonding.entries.reduce(
        (entrySum: number, entry: { balance?: string }) => 
          entrySum + Number(entry.balance ?? 0),
        0,
      ),
    0,
  )

  // Query rewards
  const rewardsResponse = await client.cosmos.distribution.v1beta1.delegationTotalRewards({
    delegatorAddress: address,
  })
  const rewards = rewardsResponse.total.reduce(
    (sum: number, reward: { denom: string; amount?: string }) =>
      reward.denom === CURRENT_CHAIN.nativeToken.denom
        ? sum + Number(reward.amount ?? 0)
        : sum,
    0,
  )

  // Query validator commission if the address is a validator
  let commission = 0
  const validatorAddress = getValidatorAddress(address)
  if (validatorAddress) {
    try {
      const validatorResponse = await client.cosmos.distribution.v1beta1.validatorCommission({
        validatorAddress,
      })
      if (validatorResponse.commission?.commission) {
        commission = validatorResponse.commission.commission.reduce(
          (sum: number, comm: { denom: string; amount?: string }) =>
            comm.denom === CURRENT_CHAIN.nativeToken.denom
              ? sum + Number(comm.amount ?? 0)
              : sum,
          0,
        )
      }
    } catch {
      // Not a validator address or other error, ignore
    }
  }

  // Query BTC delegation reward from Babylon's incentive module
  let btcDelegationReward = 0
  try {
    // Query incentive rewards through REST API
    const restEndpoint = CURRENT_CHAIN.cosmosChainInfo.chain.apis?.rest?.[0].address ?? ''
    const response = await fetch(
      `${restEndpoint}/babylon/incentive/address/${address}/reward_gauge`
    )
    const data = await response.json()
    const btcGauge = data?.reward_gauges?.btc_delegation
    if (btcGauge) {
      const totalReward = Number(btcGauge.coins?.[0]?.amount ?? 0)
      const withdrawnReward = Number(btcGauge.withdrawn_coins?.[0]?.amount ?? 0)
      btcDelegationReward = totalReward - withdrawnReward
    }
  } catch {
    // Failed to query BTC delegation reward, ignore
  }

  return {
    available,
    delegatableVesting,
    delegated,
    unbonding,
    rewards,
    btcDelegationReward,
    commission,
  }
}
