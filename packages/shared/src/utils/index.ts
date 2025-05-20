import { DEFAULT_THEME, ENABLE_SYSTEM_THEME } from '../constants/common'
import BigNumber from 'bignumber.js'
import { clsx, type ClassValue } from 'clsx'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import numeral from 'numeral'
import querystring from 'query-string'
import { twMerge } from 'tailwind-merge'
import { format, register } from 'timeago.js'

register('ko', require('timeago.js/lib/lang/ko').default)
register('vi', require('timeago.js/lib/lang/vi').default)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stringifyUrl(
  url: string,
  query?: querystring.StringifiableRecord | undefined,
) {
  return querystring.stringifyUrl({ url, query })
}

export function generatePath(
  originalPath: string,
  {
    params = {},
    query,
  }: {
    params?: Record<string, string | number | bigint>
    query?: Record<string, any>
  },
) {
  return stringifyUrl(
    !!Object.keys(params)?.length
      ? Object.keys(params)?.reduce((path, key) => {
          return path.replace(`:${key}`, (params[key] || '').toString())
        }, originalPath)
      : originalPath,
    query,
  )
}

export function shortStr(
  str?: string,
  options?: { start?: number; end?: number },
) {
  if (!str) return ''

  const start = options?.start ?? 6
  const end = options?.end ?? 7
  if (str.length <= start) return str
  return `${str.slice(0, start)}...${!!end ? str.slice(-end) : ''}`
}

export function formatNumWithPercent(
  num?: any,
  {
    decimals = 2,
    paddingZero = true,
  }: { decimals?: number; paddingZero?: boolean } = {
    decimals: 2,
    paddingZero: true,
  },
) {
  const zeroStr = Array(decimals).fill('0').join('')
  return undefined === num
    ? '0%'
    : numeral(num?.toString()).format(
        `0.${paddingZero ? zeroStr : `[${zeroStr}]`}%`,
      )
}

export function formatNumWithCommas(
  num?: number | string | bigint,
  options?: { decimals?: number; removeTailZero?: boolean },
) {
  const decimals = options?.decimals ?? 8
  const removeTailZero =
    undefined === options?.removeTailZero ? true : options?.removeTailZero
  if (undefined === num) return ''

  let [_integer, _decimal = ''] = num.toString().split('.')
  _integer = _integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  removeTailZero && (_decimal = _decimal.replace(/\.?0+$/, ''))

  return `${_integer}${!!_decimal ? `.${_decimal.slice(0, decimals)}` : ''}`
}

// 123456 -> 123,456
// 0.001234567 -> 0.001234
// 1.234567 -> 1.2345
// 0.000001234567 -> 0.0₅1234
export function formatSignificantFigures(
  num: string | number,
  significantDigitsCount = 4,
  subZeroNum = 4,
) {
  const numStr = BigNumber(num ?? 0).toFixed()
  const numStrArr = numStr.split('.')

  // 123456 -> 123,456
  if (numStrArr.length === 1)
    return formatNumWithCommas(numStr, { decimals: 0 })

  const [integerPart, decimalPart] = numStrArr
  const formattedIntegerPart = formatNumWithCommas(integerPart, { decimals: 0 })

  const zerosPart = decimalPart.match(/^0+/)?.[0] || ''
  const nonZerosPart = BigNumber(
    BigNumber(
      `0.${
        !!zerosPart.length
          ? decimalPart.split(/^0+/)?.[1]?.slice(0, significantDigitsCount + 1)
          : decimalPart?.slice(0, significantDigitsCount + 1)
      }`,
    ).toFixed(significantDigitsCount),
  )
    .multipliedBy(10 ** significantDigitsCount)
    .toFixed()
    .split(/0+$/)?.[0]

  const subStrings = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

  const zeroLength = zerosPart?.length ?? 0
  if (zeroLength > subZeroNum)
    // 0.000001234567 -> 0.0₅1234
    return `${formattedIntegerPart}.0${zeroLength
      .toString()
      .split('')
      .map(digit => subStrings[+digit])
      .join('')}${nonZerosPart}`

  // 1.234567 -> 1.2345
  return `${formattedIntegerPart}.${zerosPart}${nonZerosPart}`
}

export function intlFormatNum(
  num?: number | string | bigint,
  {
    withSpace,
    minimumFractionDigits,
    maximumFractionDigits,
  }: {
    withSpace?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = { withSpace: false, minimumFractionDigits: 0, maximumFractionDigits: 4 },
) {
  const { format } = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits,
    maximumFractionDigits,
  })

  if (undefined === num) return ''

  const formattedVal = format(Number(num))
  return !!withSpace
    ? formattedVal.replace(/(\d)(\s*\D+)/, '$1 $2')
    : formattedVal
}

export function formatTimeAgo(
  time?: number | string | bigint | null,
  locale: string = 'en',
) {
  if (!!!time) return '-'
  return format(Number(time), 'zh' === locale ? 'zh_CN' : locale)
}

export function formatUTCTime(time?: number | string | bigint) {
  if (!!!time) return '-'
  dayjs.extend(utc)
  return dayjs(Number(time)).utc().format('MMM-DD-YYYY hh:mm:ss A Z')
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatUnits(value: bigint, decimals: number) {
  let display = value.toString()

  const negative = display.startsWith('-')
  if (negative) display = display.slice(1)

  display = display.padStart(decimals, '0')

  const fraction = display.slice(display.length - decimals).replace(/(0+)$/, '')

  return `${negative ? '-' : ''}${display.slice(0, display.length - decimals) || '0'}${
    fraction ? `.${fraction}` : ''
  }`
}

export function formatBTC(value: bigint) {
  return formatUnits(value, 8)
}

export function parseUnits(value: string, decimals: number) {
  let [integer, fraction = '0'] = value.split('.')

  const negative = integer.startsWith('-')
  if (negative) integer = integer.slice(1)

  // trim trailing zeros.
  fraction = fraction.replace(/(0+)$/, '')

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1)
      integer = `${BigInt(integer) + 1n}`
    fraction = ''
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals),
    ]

    const rounded = Math.round(Number(`${unit}.${right}`))
    if (rounded > 9)
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, '0')
    else fraction = `${left}${rounded}`

    if (fraction.length > decimals) {
      fraction = fraction.slice(1)
      integer = `${BigInt(integer) + 1n}`
    }

    fraction = fraction.slice(0, decimals)
  } else {
    fraction = fraction.padEnd(decimals, '0')
  }

  return BigInt(`${negative ? '-' : ''}${integer}${fraction}`)
}

export function parseBTC(value: string) {
  return parseUnits(value, 8)
}

export function deduplicateArray(arr: any[]) {
  return Array.from(new Set(arr))
}

export function formatPageTitle(title: string) {
  return `${process.env.COSMOSCAN_PUBLIC_WEBSITE_TITLE} | ${title}`
}

export function getAppResolvedTheme(resolvedTheme?: string): 'light' | 'dark' {
  return ENABLE_SYSTEM_THEME
    ? ((resolvedTheme || DEFAULT_THEME) as 'light' | 'dark')
    : DEFAULT_THEME
}
