import { getCookieLocale } from './'
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  const locale = await getCookieLocale()

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
