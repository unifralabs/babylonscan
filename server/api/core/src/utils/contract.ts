import Prisma from '@cosmoscan/core-db'

export async function getContractDetail(
  db: typeof Prisma,
  contract_address: string,
) {
  return await db.contracts.findUnique({
    where: {
      address: contract_address,
    },
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  })
}

export async function getContractExecutionCount(
  db: typeof Prisma,
  contract_address: string,
) {
  const data = await db.$queryRaw<
    [{ execute_counts: number }]
  >`SELECT execute_counts FROM mv_contract_stats WHERE address = ${contract_address}`

  return Number(data?.[0]?.execute_counts ?? 0)
}

export async function getContractHistory(
  db: typeof Prisma,
  contract_address: string,
) {
  return await db.contract_code_history.findMany({
    where: {
      address: contract_address,
    },
    orderBy: {
      timestamp: 'desc',
    },
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  })
}

export async function searchContractsByLabel(db: typeof Prisma, label: string) {
  const contracts = await db.contracts.findMany({
    where: {
      label: {
        contains: label,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      label: true,
      address: true,
    },
  })
  return contracts
}
