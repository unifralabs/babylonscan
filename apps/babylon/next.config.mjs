import createNextIntlPlugin from 'next-intl/plugin'

import { nextDefaultConfig } from '@cosmoscan/config-nextjs'

const withNextIntl = createNextIntlPlugin(
  './node_modules/@cosmoscan/core/i18n/request.ts',
)

export default withNextIntl(nextDefaultConfig)
