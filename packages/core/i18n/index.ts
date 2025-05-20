'use server'

import { cookies } from 'next/headers'

import { defaultLocale, type Locale } from './config'

const COOKIE_NAME = 'L2SCAN_LOCALE'

export async function getCookieLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale
}

export async function setCookieLocale(locale: Locale) {
  ;(await cookies()).set(COOKIE_NAME, locale)
}
