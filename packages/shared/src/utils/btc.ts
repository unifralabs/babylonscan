import { BITCOIN_NETWORK, BTC_NETWORK, MEMPOOL_URL } from '../constants/btc'
import { Network } from '../types'
import { formatExplorerUrl } from './chain'
import { payments } from 'bitcoinjs-lib'
import {
  add,
  differenceInCalendarDays,
  differenceInWeeks,
  formatDistanceStrict,
} from 'date-fns'

export function getBTCAddressFromPublicKey(publicKey: string) {
  const { address } = payments.p2wpkh({
    pubkey: Buffer.from(publicKey, 'hex'),
    network: BITCOIN_NETWORK,
  })

  return address || ''
}

export function isValidBTCAddress(address: string) {
  if (Network.MAINNET === BTC_NETWORK)
    // console.error(
    //   "Incorrect address prefix for Mainnet. Expected address to start with 'bc1'.",
    // )
    return address?.toString()?.startsWith('bc1')

  // console.error(
  //   "Incorrect address prefix for Testnet / Signet. Expected address to start with 'tb1'.",
  // )
  return address?.toString()?.startsWith('tb1')
}

export function formatMempoolUrl(
  type: 'block' | 'address' | 'tx',
  hash: string,
) {
  return formatExplorerUrl(MEMPOOL_URL, type, hash)
}

export function formatMempoolBlockUrl(hash: string) {
  return formatMempoolUrl('block', hash)
}

export function formatMempoolTxUrl(hash: string) {
  return formatMempoolUrl('tx', hash)
}

export function formatMempoolAddressUrl(address: string) {
  return formatMempoolUrl('address', address)
}

const BLOCKS_PER_HOUR = 6
const WEEKS_PRECISION = 5
const DAY_TO_WEEK_DISPLAY_THRESHOLD = 30

/**
 * Converts a number of blocks into days or weeks
 * Returns the time in days if the difference is less than 7 days
 * Otherwise, returns the time in weeks
 *
 * @param {bigint| number | undefined} blocks - The number of blocks to convert.
 * @returns {string} - The converted time in days or weeks.
 * Rounded to 5 weeks if the difference is greater than 7 days.
 *
 * Examples of usage:
 * blocksToDisplayTime(30000); // "29 weeks"
 * blocksToDisplayTime(1); // "1 day"
 * blocksToDisplayTime(200); // "2 days"
 */
export const blocksToDisplayTime = (
  blocks: bigint | number | undefined,
): string => {
  // If no blocks are provided, return default value
  if (!blocks) return '-'
  const _blocks = Number(blocks)

  // Calculate the equivalent time in hours
  const hours = _blocks / BLOCKS_PER_HOUR

  // Calculate the start and end dates
  // get the timestamp now
  const startDate = new Date()
  const endDate = add(startDate, { hours })

  const dayDifference = differenceInCalendarDays(endDate, startDate)
  // If the difference is greater than or equal to 30 days, return the difference in weeks
  if (dayDifference >= DAY_TO_WEEK_DISPLAY_THRESHOLD) {
    // Calculate the difference in weeks
    const weeks = differenceInWeeks(endDate, startDate, {
      roundingMethod: 'ceil',
    })
    const roundedWeeks = Math.round(weeks / WEEKS_PRECISION) * WEEKS_PRECISION
    return `${roundedWeeks} weeks`
  }

  // Otherwise, return the difference in days and round up to the nearest day
  return formatDistanceStrict(startDate, endDate, {
    unit: 'day',
    roundingMethod: 'ceil',
  })
}
