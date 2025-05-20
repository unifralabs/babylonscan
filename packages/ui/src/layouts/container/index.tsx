import { PropsWithChildren, ReactNode } from 'react'

import { ScrollArea } from '../../common/scroll-area'
import ChainSwitcher from '../../components/chain-switcher'
import Footer from '../footer'
import Header from '../header'
import Menu, { MenuProps, MobileMenu } from '../menu'
import MainContainer from './main-container'
import { getTranslations } from 'next-intl/server'

import { cn } from '@cosmoscan/shared/utils'

export interface ContainerProps {
  className?: string
  menuData: MenuProps['menuData']
}

export const MAIN_SCROLL_CONTAINER_ID = 'main-scroll-container'

export default function Container({
  className,
  menuData,
  children,
}: PropsWithChildren<ContainerProps>) {
  return (
    <section className="w-h-full flex">
      <Menu className="hidden md:block" menuData={menuData} />
      <MainContainer className={cn('h-full', className)}>
        <ScrollArea id={MAIN_SCROLL_CONTAINER_ID} className="w-h-full">
          <div className="flex min-h-screen w-full flex-col">
            <Header className="sticky left-0 top-0 z-30" menuData={menuData} />
            <section className="w-full flex-1">{children}</section>
            <Footer />
          </div>
        </ScrollArea>
      </MainContainer>
    </section>
  )
}

export async function BabylonStakingAppRootContainer({
  className,
  menuData,
  children,
}: PropsWithChildren<ContainerProps>) {
  const t = await getTranslations('Home')

  return (
    <section className="w-h-full flex">
      <Menu
        className="hidden md:block"
        menuData={menuData}
        isChainSwitcherEnabled={false}
      />
      <MainContainer className={cn('h-full', className)}>
        <ScrollArea id={MAIN_SCROLL_CONTAINER_ID} className="w-h-full">
          <div className="flex min-h-screen w-full flex-col">
            <div className="flex-bt-c px-page-gap bg-card sticky left-0 top-0 z-50 h-16 w-full md:hidden">
              <ChainSwitcher
                classNames={{
                  root: 'flex md:hidden',
                  trigger: 'justify-start text-foreground',
                }}
                enabled={false}
              />
              <div className="flex-items-c gap-2 md:gap-4">
                {/* <LangSwitcher /> */}
                <MobileMenu menuData={menuData} />
              </div>
            </div>
           

            <section className="w-full flex-1">{children}</section>
            <Footer />
          </div>
        </ScrollArea>
      </MainContainer>
    </section>
  )
}

export interface PageContainerProps {
  classNames?: {
    root?: string
    title?: string
  }
  title?: ReactNode
}

export function PageContainer({
  classNames,
  title,
  children,
}: PropsWithChildren<PageContainerProps>) {
  return (
    <section className={cn('p-page-gap w-full', classNames?.root)}>
      {!!title && (
        <div
          className={cn(
            'mb-gap md:mb-page-gap text-2xl font-medium leading-10 md:text-[1.7rem]',
            classNames?.title,
          )}
        >
          {title}
        </div>
      )}
      {children}
    </section>
  )
}
