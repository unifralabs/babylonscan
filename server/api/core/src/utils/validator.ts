import Prisma, { PrismaType } from '@cosmoscan/core-db'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import { ValidatorsSortTypeEnum } from '@cosmoscan/shared/types'
import { CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'

export async function getValidators(
  db: typeof Prisma,
  {
    take = CONSTANT.tableDefaultPageSize,
    skip = 0,
    sort = ValidatorsSortTypeEnum.COMMISSION,
    desc = true,
    includeTotalDelegations = false,
    status,
    jailed,
    search,
  }: {
    take: number
    skip?: number
    sort?: ValidatorsSortTypeEnum
    desc?: boolean
    includeTotalDelegations?: boolean
    status?: string
    jailed?: boolean
    search?: string
  },
) {
  const items = await db.validators.findMany({
    take: take + 1,
    skip,
    where: {
      ...(status ? { status } : {}),
      ...(typeof jailed === 'boolean' ? { jailed } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { operator_address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ [sort]: desc ? 'desc' : 'asc' }, { name: 'asc' }],
    omit: {
      raw_json: true,
      inserted_at: true,
      updated_at: true,
    },
  })

  let nextCursor: { take: number; skip: number } | undefined = undefined
  if (items.length > take) {
    items.pop()
    nextCursor = { take, skip: skip + take }
  }

  // Get the latest epoch for each validator
  const lastSignedEpochs = await db.babylon_epoch_validators.findMany({
    where: {
      validator: {
        in: items.map(item => item.operator_address)
      }
    },
    orderBy: {
      epoch: 'desc'
    },
    distinct: ['validator'],
    select: {
      validator: true,
      epoch: true
    }
  })

  const uptimes = await getValidatorsUptimePercentByOperatorAddresses(
    db,
    items?.map(({ operator_address }) => operator_address),
  )

  const inclusions = await getValidatorsInclusionByOperatorAddresses(
    db,
    items?.map(({ operator_address }) => operator_address),
  )

  async function getTotalDelegations() {
    return await db.validators_delegations.groupBy({
      by: ['validator'],
      where: {
        validator: {
          in: items.map(({ operator_address }) => operator_address),
        },
      },
      _sum: {
        amount: true,
      },
    })
  }
  let totalDelegations: Awaited<ReturnType<typeof getTotalDelegations>>
  if (includeTotalDelegations) {
    totalDelegations = await getTotalDelegations()
  }

  // Get total voting power for calculating cumulative share
  const { totalVotingPower } = await getTotalValidatorsVotingPowerAndBonded(db)
  
  // Calculate cumulative share if sorting by voting power in descending order
  let cumulativeVotingPower = 0
  
  // We need to sort items by voting power if that's not the current sort
  let itemsForCumulative = [...items]
  if (sort !== ValidatorsSortTypeEnum.VOTING_POWER || !desc) {
    itemsForCumulative.sort((a, b) => Number(b.voting_power || 0) - Number(a.voting_power || 0))
  }
  
  // Calculate cumulative share for each validator
  const cumulativeShares = new Map<string, number>()
  itemsForCumulative.forEach(item => {
    cumulativeVotingPower += Number(item.voting_power || 0)
    const cumulativeShare = (cumulativeVotingPower / totalVotingPower) * 100
    cumulativeShares.set(item.operator_address, cumulativeShare)
  })

  return {
    items: items?.map(item => ({
      ...item,
      babylon_epoch_validators: [], // Add empty array to maintain compatibility with original structure
      lastSignedEpoch: lastSignedEpochs.find(e => e.validator === item.operator_address)?.epoch,
      uptime: uptimes?.find(
        ({ operator_address }) => operator_address === item.operator_address,
      ),
      inclusion: inclusions?.find(
        ({ validator }) => validator === item.operator_address,
      ),
      totalDelegations: Number(
        totalDelegations?.find(
          ({ validator }) => validator === item.operator_address,
        )?._sum?.amount ?? 0,
      ),
      cumulativeShare: cumulativeShares.get(item.operator_address) || 0,
    })),
    nextCursor,
  }
}

export async function getValidatorDetail(
  db: typeof Prisma,
  validatorAddress: string,
) {
  const [data, uptime, delegatorsCount = 0] = await Promise.all([
    db.validators.findUnique({
      where: {
        operator_address: validatorAddress,
      },
    }),
    getValidatorUptimePercentByOperatorAddress(db, validatorAddress),
    db.validators_delegations.count({
      where: {
        validator: validatorAddress,
      },
    }),
  ])

  const voteCount = await db.proposal_votes.count({
    where: {
      voter: data?.owner_address,
    },
  })

  return { ...data, uptime, delegatorsCount, voteCount }
}

export async function getTotalValidatorsVotingPowerAndBonded(
  db: typeof Prisma,
) {
  const { _sum } = await db.validators.aggregate({
    _sum: {
      voting_power: true,
      self_bonded: true,
    },
  })

  return {
    totalVotingPower: Number(_sum.voting_power ?? 0),
    totalBonded: Number(_sum.self_bonded ?? 0),
  }
}

export async function getValidatorUptimePercentByOperatorAddress(
  db: typeof Prisma,
  operator_address?: string,
) {
  const data = (
    await db.$queryRaw<
      [
        {
          operator_address: string
          signed_block_count: number
          total_block_count: number
          uptime_percentage: number
        },
      ]
    >(PrismaType.sql`
        SELECT operator_address, uptime_percentage
        FROM mv_validator_uptime
        WHERE operator_address = ${operator_address}`)
  )?.[0]

  return {
    uptime: Number(data?.uptime_percentage ?? 0),
    missedBlocks:
      Number(data?.total_block_count ?? 0) -
      Number(data?.signed_block_count ?? 0),
  }
}

export async function getValidatorsUptimePercentByOperatorAddresses(
  db: typeof Prisma,
  operator_addresses?: string[],
) {
  // Return empty array if no operator addresses are provided or the array is empty
  if (!operator_addresses || operator_addresses.length === 0) {
    return []
  }

  return (
    await db.$queryRaw<
      [
        {
          operator_address: string
          signed_block_count: number
          total_block_count: number
          uptime_percentage: number
        },
      ]
    >(PrismaType.sql`
        SELECT operator_address, signed_block_count, total_block_count, uptime_percentage
        FROM mv_validator_uptime
        WHERE operator_address IN (${PrismaType.join(operator_addresses)})`)
  )?.map(item => ({
    ...item,
    uptime: Number(item?.uptime_percentage ?? 0),
    missedBlocks:
      Number(item?.total_block_count ?? 0) -
      Number(item?.signed_block_count ?? 0),
  }))
}

export async function getValidatorsInclusionByOperatorAddresses(
  db: typeof Prisma,
  validator?: string[],
) {
  // Return empty array if no validator addresses are provided or the array is empty
  if (!validator || validator.length === 0) {
    return []
  }

  return (
    await db.$queryRaw<
      [
        {
          validator: string
          appearance_count: number
          total_count: number
          inclusion_rate: number
        },
      ]
    >(PrismaType.sql`
        SELECT validator, appearance_count, total_count, inclusion_rate
        FROM mv_validator_inclusion_rate
        WHERE validator IN (${PrismaType.join(validator)})`)
  )?.map(item => ({
    ...item,
    appearanceCount: Number(item?.appearance_count ?? 0),
    totalCount: Number(item?.total_count ?? 0),
    rate: Number(item?.inclusion_rate ?? 0),
  }))
}

export async function getValidatorStatusCounts(db: typeof Prisma) {
  const data = await db.$queryRaw<
    Array<{
      status: string
      jailed: boolean
      count: bigint
    }>
  >(PrismaType.sql`
    SELECT status, jailed, COUNT(*) as count
    FROM validators
    GROUP BY status, jailed
    ORDER BY status, jailed
  `)

  return data.map(item => ({
    ...item,
    count: Number(item.count)
  }))
}

/**
 * Get the validator's signature status for recent blocks
 * @param db Prisma client
 * @param validatorAddress Validator address
 * @param limit Number of blocks to retrieve, defaults to 100
 * @returns Array containing block heights and signature status
 */
export async function getValidatorLatestBlockSignatures(
  db: typeof Prisma,
  validatorAddress: string,
  limit: number = 100
) {
  // We use a raw SQL query here because we need to get the latest block signature data
  // When implementing, you need to adjust this query according to your database structure
  // This example assumes you have a validator_block_signatures table storing signature data
  try {
    const data = await db.$queryRaw<
      Array<{
        block_height: bigint
        signed: boolean
      }>
    >(PrismaType.sql`
      SELECT block_height, signed
      FROM validator_block_signatures
      WHERE validator = ${validatorAddress}
      ORDER BY block_height DESC
      LIMIT ${limit}
    `)

    return data.map(item => ({
      height: Number(item.block_height),
      signed: item.signed
    }))
  } catch (error) {
    console.error('Error fetching validator block signatures:', error)
    return []
  }
}

// If you don't have a dedicated signatures table, you can use this alternative method to get data from block signatures
export async function getValidatorLatestBlockSignaturesFromPrecommits(
  db: typeof Prisma,
  validatorAddress: string,
  limit: number = 100
) {
  console.log(`Fetching block signatures for validator ${validatorAddress}`)
  
  // Get blocks signed by the validator directly from block_signatures
  const signedBlocks = await db.block_signatures.findMany({
    where: {
      validator_address: validatorAddress,
      signed: 1 // In the schema, signed is an Int where 1 means signed
    },
    select: {
      block_height: true
    },
    orderBy: {
      block_height: 'desc'
    },
    take: limit,
    distinct: ['block_height']
  })
  
  // Convert to the expected format
  const result = signedBlocks.map(block => ({
    height: Number(block.block_height),
    signed: true // These are all signed blocks
  }))
  
  console.log(`Found ${result.length} signed blocks`)
  
  // Log the first few blocks for debugging
  if (result.length > 0) {
    console.log('First 5 blocks:', JSON.stringify(result.slice(0, 5)))
  }
  
  return result
}

export async function getValidatorProposedBlocks(
  db: typeof Prisma,
  validatorAddress: string,
  {
    take = CONSTANT.tableDefaultPageSize,
    skip = 0,
  }: {
    take: number
    skip?: number
  },
) {
  // Get blocks proposed by the validator
  const items = await db.blocks.findMany({
    where: {
      proposer_address: validatorAddress,
    },
    select: {
      height: true,
      hash: true,
      num_txs: true,
      timestamp: true,
    },
    orderBy: {
      height: 'desc',
    },
    take: take + 1,
    skip,
  })

  // Handle pagination
  let nextCursor: { take: number; skip: number } | undefined = undefined
  if (items.length > take) {
    items.pop()
    nextCursor = { take, skip: skip + take }
  }

  return { items, nextCursor }
}

export async function getValidatorProposedBlocksCount(
  db: typeof Prisma,
  validatorAddress: string,
) {
  // Count blocks proposed by the validator
  const count = await db.blocks.count({
    where: {
      proposer_address: validatorAddress,
    },
  })

  return count
}

export async function getValidatorMetrics(db: typeof Prisma) {
  try {
    const data = await db.$queryRaw<
      Array<{
        total_ubbn_staked: number;
        last_epoch_urewards: number;
        avg_apy: number;
        validator_count: number;
      }>
    >`SELECT
        total_ubbn_staked,
        last_epoch_urewards,
        avg_apy,
        validator_count
      FROM mv_validator_metrics
      LIMIT 1`

    if (!data || data.length === 0) {
      return {
        totalUbbnStaked: 0,
        lastEpochRewards: 0,
        avgApy: 0,
        validatorCount: 0
      }
    }

    return {
      totalUbbnStaked: Number(data[0].total_ubbn_staked),
      lastEpochRewards: Number(data[0].last_epoch_urewards) / 10 ** CURRENT_CHAIN.nativeToken.decimals, // Convert from micro to standard unit
      avgApy: Number(data[0].avg_apy), // No conversion needed for percentage
      validatorCount: Number(data[0].validator_count) // No conversion needed for count
    }
  } catch (error) {
    console.error('Error fetching validator metrics:', error)
    return {
      totalUbbnStaked: 0,
      lastEpochRewards: 0,
      avgApy: 0,
      validatorCount: 0
    }
  }
}


