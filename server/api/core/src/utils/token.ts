import type { TokenImageJson, TokenLinksJson } from '../types'
import BigNumber from 'bignumber.js'

import Prisma from '@cosmoscan/core-db'
import { CONSTANT } from '@cosmoscan/shared/constants/common'
import {
  TokenTopHoldersSortTypeEnum,
  TokenTrackerSortTypeEnum,
  TokenTrackerTypeEnum,
} from '@cosmoscan/shared/types'

export interface TokenWithMarketData {
  // meta data
  denom: string
  type: TokenTrackerTypeEnum
  name: string | null
  symbol: string | null
  description: string | null
  display_denom: string | null
  uri: string | null
  uri_hash: string | null
  decimals: number
  logo: string
  links: {
    whitepaper: string
    twitter: string
    telegram?: string
    discord?: string
    reddit?: string
    medium?: string
    instagram?: string
    youtube?: string
  }
  // market data
  price: number | string
  price_change_percentage_24h: number | string
  market_cap?: number | string
  circulating_market_cap: number | string
  volume_24h: number | string
  total_supply: number | string
  circulating_supply: number | string
  holders: number | string
}

export async function formatTokensData(
  db: typeof Prisma,
  data: any,
): Promise<TokenWithMarketData[]> {
  const holders = await getTokensHoldersCount(db)

  return data?.map((item: any) => {
    const {
      denom,
      decimals = 0,
      type,
      coin_name,
      coin_symbol,
      coin_meta,
      coin_market_data,
      total_supply,
    } = item
    if (!coin_meta)
      return {
        // meta data
        denom,
        type: type as TokenTrackerTypeEnum,
        name: coin_name,
        symbol: coin_symbol,
        description: '',
        display_denom: '',
        uri: '',
        uri_hash: '',
        decimals: Number(decimals ?? 0),
        logo: '',
        links: {
          whitepaper: '',
          twitter: '',
          telegram: '',
          discord: '',
          reddit: '',
          medium: '',
          instagram: '',
          youtube: '',
        },
        // market data
        price: 0,
        price_change_percentage_24h: 0,
        market_cap: 0,
        circulating_market_cap: 0,
        volume_24h: 0,
        total_supply: 0,
        circulating_supply: 0,
        holders: 0,
      }

    const { description, display_denom, uri, uri_hash } = coin_meta

    // logo
    const image = coin_meta?.image as TokenImageJson
    const logo =
      [image?.large, image?.small, image?.thumb].filter(url =>
        url?.includes('http'),
      )?.[0] || ''

    // links
    const links = coin_meta?.links as TokenLinksJson
    const socialLinks = [
      ...(links?.official_forum_url || []),
      ...(links?.announcement_url || []),
    ]
    function getLinkByStr(str: string) {
      return socialLinks?.find((url: string) => url?.includes(str))
    }
    const whitepaper = links?.whitepaper || ''
    const twitter =
      getLinkByStr('twitter.com') ||
      (!!links?.twitter_screen_name
        ? `https://twitter.com/${links?.twitter_screen_name}`
        : '')
    const telegram = !!links?.telegram_channel_identifier
      ? `https://t.me/${links?.telegram_channel_identifier}`
      : getLinkByStr('t.me')
    const discord = getLinkByStr('discord.gg')
    const reddit = getLinkByStr('reddit.com') || links?.subreddit_url
    const medium = getLinkByStr('medium.com')
    const instagram = getLinkByStr('instagram.com')
    const youtube = getLinkByStr('youtube.com')

    // Keep two significant figures
    function formatNum(value: string | number | any, precision = 5) {
      const val = Number(value || 0)
      if (!!!val) return val
      const isNegative = val.toString().includes('-')
      const prefix = isNegative ? '-' : ''
      const valStr = isNegative
        ? val.toString().split('-')?.[1]
        : val.toString()
      if (valStr.includes('.')) {
        const [before, after] = valStr.split('.')
        const afterVal = parseFloat(
          Number(`0.${after.slice(0, 10)}`).toPrecision(precision),
        )
        return `${prefix}${
          afterVal > 0
            ? BigNumber(before).plus(afterVal).toString()
            : `${before}.${afterVal.toString().slice(2)}`
        }`
      }
      return val
    }

    return {
      // meta data
      denom,
      type: type as TokenTrackerTypeEnum,
      name: coin_name,
      symbol: coin_symbol,
      description,
      display_denom,
      uri,
      uri_hash,
      decimals: Number(decimals ?? 0),
      logo,
      links: {
        whitepaper,
        twitter,
        telegram,
        discord,
        reddit,
        medium,
        instagram,
        youtube,
      },
      // market data
      price: formatNum(coin_market_data?.price),
      price_change_percentage_24h: formatNum(
        coin_market_data?.price_change_percentage_24h,
        2,
      ),
      circulating_market_cap: formatNum(
        coin_market_data?.circulating_market_cap,
      ),
      volume_24h: formatNum(coin_market_data?.volume_24h),
      total_supply: formatNum(total_supply || coin_market_data?.total_supply),
      circulating_supply: formatNum(coin_market_data?.circulating_supply),
      holders: Number(holders?.find(item => item.denom === denom)?._count ?? 0),
    }
  })
}

export async function getTokensHoldersCount(db: typeof Prisma) {
  return await db.coin_balance.groupBy({
    by: ['denom'],
    _count: true,
  })
}

export async function getTokenTopHolders(
  db: typeof Prisma,
  {
    denom,
    take = CONSTANT.tableDefaultPageSize,
    skip = 0,
    sort = TokenTopHoldersSortTypeEnum.BALANCE,
    desc = true,
  }: {
    denom: string
    take: number
    skip?: number
    sort?: string
    desc?: boolean
  },
) {
  const items = await db.coin_balance.findMany({
    take: take + 1,
    skip,
    where: {
      denom,
    },
    orderBy: [{ [sort]: desc ? 'desc' : 'asc' }, { id: 'asc' }],
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

  return { items, nextCursor }
}

async function fetchAndCombineTokenData(
  db: typeof Prisma,
  coinDenoms: any[],
  sort?: TokenTrackerSortTypeEnum,
  desc: boolean = true
) {
  const coinNames = coinDenoms.map(denom => denom.coin_name).filter(Boolean) as string[];
  const coinSymbols = coinDenoms.map(denom => denom.coin_symbol).filter(Boolean) as string[];

  const coinMetas = await db.coin_meta.findMany({
    where: {
      OR: [
        { coin_name: { in: coinNames } },
        { coin_symbol: { in: coinSymbols } }
      ]
    },
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  });

  const coinMarketData = await db.coin_market_data.findMany({
    where: {
      OR: [
        { coin_name: { in: coinNames } },
        { coin_symbol: { in: coinSymbols } }
      ]
    },
    ...(sort ? {
      orderBy: [
        { [sort as keyof typeof db.coin_market_data.fields]: desc ? 'desc' : 'asc' }
      ]
    } : {}),
    omit: {
      inserted_at: true,
      updated_at: true,
    },
  });

  const data = coinDenoms.map(denom => {
    const meta = coinMetas.find(meta => 
      meta.coin_name === denom.coin_name || meta.coin_symbol === denom.coin_symbol
    );
    const marketData = coinMarketData.find(market => 
      market.coin_name === denom.coin_name || market.coin_symbol === denom.coin_symbol
    );

    return {
      ...denom,
      coin_meta: meta || null,
      coin_market_data: marketData || null
    };
  });

  // 如果提供了排序参数，对组合后的数据进行排序
  if (sort && sort in TokenTrackerSortTypeEnum) {
    data.sort((a, b) => {
      const valueA = a.coin_market_data ? a.coin_market_data[sort as keyof typeof a.coin_market_data] || 0 : 0;
      const valueB = b.coin_market_data ? b.coin_market_data[sort as keyof typeof b.coin_market_data] || 0 : 0;
      return desc ? Number(valueB) - Number(valueA) : Number(valueA) - Number(valueB);
    });
  }

  return data;
}

export async function getTokens(
  db: typeof Prisma,
  {
    type = TokenTrackerTypeEnum.TRENDING,
    take = CONSTANT.tableDefaultPageSize,
    skip = 0,
    sort = TokenTrackerSortTypeEnum.CIRCULATING_MARKET_CAP,
    desc = true,
  }: {
    take: number
    skip?: number
    type?: TokenTrackerTypeEnum
    sort?: TokenTrackerSortTypeEnum
    desc?: boolean
  },
) {
  const coinDenoms = await db.coin_denoms.findMany({
    take: take + 1,
    skip,
    where: {
      type,
    },
    orderBy: [
      { coin_name: 'asc' },
    ],
    omit: {
      denom_trace: true,
      inserted_at: true,
      updated_at: true,
    },
  })

  let nextCursor: { take: number; skip: number } | undefined = undefined
  if (coinDenoms.length > take) {
    coinDenoms.pop()
    nextCursor = { take, skip: skip + take }
  }

  const data = await fetchAndCombineTokenData(db, coinDenoms, sort, desc);
  const items = await formatTokensData(db, data);

  return {
    items,
    nextCursor,
  }
}

export async function getTokensByDenoms(db: typeof Prisma, denoms: string[]) {
  const coinDenoms = await db.coin_denoms.findMany({
    where: {
      denom: {
        in: denoms,
      },
    },
    omit: {
      denom_trace: true,
      inserted_at: true,
      updated_at: true,
    },
  });

  const data = await fetchAndCombineTokenData(db, coinDenoms);
  return formatTokensData(db, data);
}

export async function searchTokensByDenom(db: typeof Prisma, denom: string) {
  const coinDenoms = await db.coin_denoms.findMany({
    where: {
      denom: {
        contains: denom,
        mode: 'insensitive',
      },
    },
    omit: {
      denom_trace: true,
      inserted_at: true,
      updated_at: true,
    },
  });

  const data = await fetchAndCombineTokenData(db, coinDenoms);
  return formatTokensData(db, data);
}
