import Prisma from '@cosmoscan/core-db'

export async function getCodeDetail(db: typeof Prisma, code_id: number) {
  return await db.contract_codes.findUnique({
    where: {
      code_id,
    },
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  })
}
