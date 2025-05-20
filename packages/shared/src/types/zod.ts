import { CONSTANT } from '../constants/common'
import { isValidAddress } from '../utils/chain'
import { z } from 'zod'

export const stringToNumberZodType = z
  .union([z.string(), z.number()])
  .refine(val => !Number.isNaN(Number(val ?? 0)), {
    message: 'Invalid number',
  })
  .transform(val => Number(val))

export const stringToBooleanZodType = z
  .union([z.enum(['true', 'false']), z.boolean()])
  .transform(val => val.toString() === 'true')

export const addressZodType = z.string().refine(val => !!val, {
  message: 'Invalid address',
})

export const cosmosAddressZodType = z
  .string()
  .refine(isValidAddress, 'Invalid address!')

export const denomZodType = z.string().refine(val => !!val, {
  message: 'Invalid denom',
})


export const internalZodType = {
  pagination: {
    take: z
      .number()
      .min(1)
      .max(50)
      .optional()
      .default(CONSTANT.tableDefaultPageSize),
    skip: z.number().optional().default(0),
  },
}

export const paginationZodType = z
  .object({
    take: internalZodType.pagination.take,
    skip: internalZodType.pagination.skip,
  })
  .optional()
