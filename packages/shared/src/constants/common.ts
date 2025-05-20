import { CURRENT_CHAIN } from './chains'

export const SUPPORTED_THEME: 'all' | 'light' | 'dark' =
  (process.env.COSMOSCAN_PUBLIC_SUPPORTED_THEME as 'all' | 'light' | 'dark') ||
  'all'
export const ENABLE_SYSTEM_THEME = 'all' === SUPPORTED_THEME
export const DEFAULT_THEME: 'light' | 'dark' = (
  ENABLE_SYSTEM_THEME ? 'light' : SUPPORTED_THEME
) as 'light' | 'dark'

export const SOCIAL_LINKS = {
  feedback: 'https://6s04oc3w9bm.typeform.com/to/Xaoq8SVM',
  request: 'https://l2scan.canny.io/l2scan',
  donate:
    'https://scroll.l2scan.co/address/0xFDBab5e7404bC92a33245651B1D1828d3BEb7C21',
  investment: 'https://hg9dxf4josj.typeform.com/to/ZFAT2ulj',

  twitter: 'https://twitter.com/l2scan',
  discord: 'https://discord.gg/ak69cmCyCB',
  apiEnterprisePlanContact: 'https://t.me/gfw1990',
}

export const CONSTANT = {
  tableDefaultPageSize: 20,
}

export const STORE_NAME_PREFFIX = CURRENT_CHAIN?.name
  .replaceAll(' ', '-')
  .toLocaleLowerCase()
