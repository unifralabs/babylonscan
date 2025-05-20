import { PropsWithChildren, ReactNode, SVGProps } from 'react'

import Link from 'next/link'

import { getTranslations } from 'next-intl/server'

import { ChainTypeEnum, CURRENT_CHAIN } from '@cosmoscan/shared/constants/chain'
import { cn } from '@cosmoscan/shared/utils'
import { Card } from '@cosmoscan/ui/card'
import { StatisticalDataCards } from '@cosmoscan/ui/components/statistical-data-card'
import { BabylonHomeBannerIcon } from '@cosmoscan/ui/icons/home-banner/babylon'
import { CosmosHubHomeBannerIcon } from '@cosmoscan/ui/icons/home-banner/cosmos-hub'

export function HomePageWrapper({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn('p-page-gap gap-gap flex flex-col', className)}>
      {children}
    </section>
  )
}

export async function HomeBannerWrapper() {
  const t = await getTranslations('Home')

  const BannerInfo = {
    [ChainTypeEnum.BABYLON]: {
      icon: BabylonHomeBannerIcon,
      desc: t('babylonBannerDesc'),
    },
    [ChainTypeEnum.COSMOS_HUB]: {
      icon: CosmosHubHomeBannerIcon,
      desc: t('cosmosHubBannerDesc'),
    },
  }[CURRENT_CHAIN.type]

  return (
    <Card className="px-page-gap flex items-end justify-between gap-[4%] lg:px-12">
      <div className="my-auto py-6">
        <h1 className="mb-4 text-2xl font-semibold">
          {CURRENT_CHAIN.name.toLowerCase().includes('babylon')
            ? 'BabylonScan'
            : t('CosmosHub.Home.chainTitle', { chainName: CURRENT_CHAIN.name })}
        </h1>
        <p className="text-foreground-secondary">{BannerInfo.desc}</p>
      </div>

      <BannerInfo.icon className="mt-4 hidden h-[140px] w-fit shrink-0 lg:block" />
    </Card>
  )
}

export function HomeStatisticalDataWrapper({
  statisticalData,
}: {
  statisticalData: {
    title?: ReactNode
    content: {
      icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
      label: ReactNode
      value: string | JSX.Element
    }[]
  }[]
}) {
  return statisticalData.map(({ title, content }, index) => (
    <div key={index} className="w-full">
      {!!title && (
        <div className="mb-gap text-foreground-secondary text-lg font-medium">
          {title}
        </div>
      )}
      <StatisticalDataCards
        className="gap-page-gap lg:gap-gap grid w-full grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"
        items={content}
      />
    </div>
  ))
}

export function HomeTableDataWrapper({
  tableData,
}: {
  tableData: {
    title: string
    linkText: string
    link: string
    content: ReactNode
  }[]
}) {
  return (
    <div className="gap-page-gap 2xl:gap-gap grid grid-cols-1 2xl:grid-cols-2">
      {tableData.map(({ title, linkText, link, content }) => (
        <Card key={title} className="p-page-gap">
          <div className="flex-bt-c mb-2 md:mb-6">
            <span className="text-lg">{title}</span>
            <Link
              className="bg-secondary hover:bg-foreground hover:text-background rounded-lg px-3 py-2 text-sm transition-all"
              href={link}
            >
              {linkText}
            </Link>
          </div>
          <div className="w-full overflow-x-auto">{content}</div>
        </Card>
      ))}
    </div>
  )
}
