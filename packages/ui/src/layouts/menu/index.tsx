'use client'

import { createElement, memo, useEffect, type ReactNode } from 'react'

import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../common/accordion'
import { Button } from '../../common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../common/dropdown-menu'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '../../common/menubar'
import { ScrollArea } from '../../common/scroll-area'
import { Tooltip } from '../../common/tooltip'
import ChainSwitcher from '../../components/chain-switcher'
import MenuSwitcher from '../../components/menu-switcher'
import { DiscordIcon, TwitterIcon } from '../../icons/socials'
import { FeedbackIcon } from '../../icons/socials/feedback'
import { MAIN_SCROLL_CONTAINER_ID } from '../container'
import { ChevronRight, Ellipsis, Menu as MenuIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMedia, useToggle } from 'react-use'

import { SOCIAL_LINKS } from '@cosmoscan/shared/constants/common'
import { useCommonStore } from '@cosmoscan/shared/providers/common-store-provider'
import { cn, generatePath } from '@cosmoscan/shared/utils'

type MenuItem = {
  label?: ReactNode
  labelKey?: string
  icon: ReactNode
  link?: string
  isExternal?: boolean
  children?: {
    label?: ReactNode
    labelKey?: string
    link: string
    isExternal?: boolean
  }[]
}

export interface MenuProps {
  className?: string
  isMenuCollapsed?: boolean
  menuData?: MenuItem[]
  isChainSwitcherEnabled?: boolean
}

const SocialLinks = [
  { label: 'twitter', icon: TwitterIcon, link: SOCIAL_LINKS.twitter },
  { label: 'discord', icon: DiscordIcon, link: SOCIAL_LINKS.discord },
  { label: 'feedback', icon: FeedbackIcon, link: SOCIAL_LINKS.feedback },
]

function SocialLinksWrapper() {
  const t = useTranslations('Footer')
  return SocialLinks.map(({ label, icon, link }) => (
    <Link key={label} href={link} target="_blank" rel="noopener noreferrer">
      <Tooltip content={t(label)}>
        <Button variant="ghost" size="icon">
          {createElement(icon, {
            className: '!size-4',
          })}
        </Button>
      </Tooltip>
    </Link>
  ))
}

function Menu({ menuData, className, isChainSwitcherEnabled }: MenuProps) {
  const t = useTranslations('Menu')
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const isSmallSize = useMedia('(max-width: 1280px)', false)
  const isMenuCollapsed = useCommonStore(state => state.isMenuCollapsed)
  const toggleMenuCollapsed = useCommonStore(state => state.toggleMenuCollapsed)

  useEffect(() => {
    toggleMenuCollapsed(isSmallSize)
  }, [isSmallSize, toggleMenuCollapsed])

  return (
    <menu
      className={cn(
        'bg-menu border-border-light h-full overflow-hidden border-r',
        isMenuCollapsed ? 'w-menu-collapse-w' : 'w-menu-w',
        className,
      )}
    >
      <ScrollArea className="w-h-full">
        <div className={cn('flex min-h-screen flex-col overflow-hidden')}>
          <div
            className={cn(
              'p-page-gap bg-foreground sticky left-0 top-0 w-full backdrop-blur',
              isMenuCollapsed && 'px-2',
            )}
          >
            <ChainSwitcher
              classNames={{ content: 'w-menu-w' }}
              withText={!isMenuCollapsed}
              enabled={isChainSwitcherEnabled}
            />
          </div>

          <Menubar className="p-page-gap flex w-full flex-1 flex-col gap-4 bg-transparent">
            {menuData?.map(
              (
                { label, labelKey, icon, children, link, isExternal },
                index,
              ) => {
                const active =
                  link === pathname ||
                  children?.some(
                    c => generatePath(c.link, { params } as any) === pathname,
                  )
                const itemWrapperClass = cn(
                  'hover:bg-accent data-[state=open]:bg-accent group !m-0 w-full cursor-pointer rounded-lg text-lg font-normal transition-colors hover:font-medium',
                  isMenuCollapsed ? 'flex-c h-14 w-14 p-0' : 'flex-bt-c p-3',
                  active && 'bg-accent font-medium',
                )
                const itemContent = (
                  <div
                    className={cn(
                      'gap-4',
                      isMenuCollapsed ? 'flex-c' : 'flex-items-c',
                    )}
                  >
                    <div
                      className={cn(
                        'group-hover:text-primary group-data-[state=open]:text-primary flex-items-c size-7 font-normal transition-colors [&>svg]:size-6',
                        active && 'text-primary font-medium',
                      )}
                    >
                      {icon}
                    </div>
                    {!isMenuCollapsed && (
                      <span>{!!labelKey ? t(labelKey) : label}</span>
                    )}
                  </div>
                )

                return !!link ? (
                  <Link
                    key={index}
                    className={itemWrapperClass}
                    href={link}
                    target={!!isExternal ? '_blank' : ''}
                    rel="noopener noreferrer"
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <MenubarMenu key={index}>
                    <MenubarTrigger className={itemWrapperClass}>
                      {itemContent}
                      {!isMenuCollapsed && !!children?.length && (
                        <ChevronRight className="group-hover:text-primary text-foreground-secondary group-data-[state=open]:text-primary h-5 w-5" />
                      )}
                    </MenubarTrigger>

                    {!!children?.length && (
                      <MenubarContent
                        className="flex flex-col"
                        side="right"
                        sideOffset={30}
                        align="start"
                      >
                        {children.map(
                          (
                            {
                              label: cLabel,
                              labelKey: cLabelKey,
                              link: cLink,
                              isExternal: cIsExternal,
                            },
                            cIndex,
                          ) => (
                            <MenubarItem
                              key={`${index}-${cIndex}`}
                              className={cn(
                                'text-popover-foreground hover:bg-accent cursor-pointer whitespace-nowrap rounded-lg p-3 text-base font-normal hover:font-medium',
                                generatePath(cLink, { params } as any) ===
                                  pathname && '!text-primary font-medium',
                              )}
                              onClick={() =>
                                !!cIsExternal
                                  ? window.open(cLink)
                                  : router.push(cLink)
                              }
                            >
                              <span>{!!cLabelKey ? t(cLabelKey) : cLabel}</span>
                            </MenubarItem>
                          ),
                        )}
                      </MenubarContent>
                    )}
                  </MenubarMenu>
                )
              },
            )}
          </Menubar>

          <div className="w-full">
            <div className="flex-c border-secondary gap-6 border-b py-4">
              {isMenuCollapsed ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Ellipsis size={22} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="flex-items-c min-w-0 gap-2 px-4"
                    side="right"
                    sideOffset={30}
                  >
                    <SocialLinksWrapper />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <SocialLinksWrapper />
              )}
            </div>

            <div className="flex-c w-full py-4">
              <MenuSwitcher />
            </div>
          </div>
        </div>
      </ScrollArea>
    </menu>
  )
}

export default memo(Menu)

export interface MobileMenuProps extends Omit<MenuProps, 'MenuProps'> {
  className?: string
}

export function MobileMenu({ className, menuData }: MobileMenuProps) {
  const t = useTranslations('Menu')
  const params = useParams()
  const pathname = usePathname()

  const [isMenuOpen, toggleIsMenuOpen] = useToggle(false)

  useEffect(() => {
    const scrollWrapper = document
      ?.getElementById(MAIN_SCROLL_CONTAINER_ID)
      ?.querySelector('div')
    !!scrollWrapper &&
      (scrollWrapper.style.overflowY = !!isMenuOpen ? 'hidden' : 'auto')
  }, [isMenuOpen])

  return (
    <div className={cn('block md:hidden', className)}>
      <Button
        className="flex-c bg-background text-foreground hover:bg-background/90 size-7 shrink-0 p-0 md:size-9"
        size="sm"
        onClick={toggleIsMenuOpen}
      >
        <MenuIcon className="!size-[14px]" />
      </Button>

      <div
        className={cn(
          'fixed inset-x-0 top-0 z-50 h-screen w-screen',
          isMenuOpen ? 'scale-100' : 'scale-0',
        )}
      >
        <div
          className={cn(
            'w-h-full absolute inset-0 z-0 bg-black/50 transition-opacity duration-300',
            isMenuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={toggleIsMenuOpen}
        ></div>
        <div
          className={cn(
            'bg-card relative z-10 flex h-screen w-[65vw] min-w-[250px] origin-top-left flex-col overflow-x-hidden transition-all duration-300',
            isMenuOpen
              ? 'translate-x-0 opacity-100'
              : '-translate-x-[100%] opacity-0',
          )}
        >
          <div className="w-full flex-1 overflow-y-auto overflow-x-hidden py-5">
            {menuData?.map(
              (
                { label, labelKey, icon, children, link, isExternal },
                index,
              ) => {
                const active =
                  link === pathname ||
                  children?.some(
                    c => generatePath(c.link, { params } as any) === pathname,
                  )

                const itemWrapperClass = cn(
                  'flex-bt-c relative !m-0 w-full cursor-pointer px-6 py-4 font-normal transition-colors',
                  active && 'text-primary font-medium',
                )

                const itemContent = (
                  <div className="flex-items-c gap-4">
                    <div
                      className={cn(
                        'flex-c h-6 w-6 font-normal transition-colors',
                        active && 'text-primary font-medium',
                      )}
                    >
                      {icon}
                    </div>
                    <span>{!!labelKey ? t(labelKey) : label}</span>
                  </div>
                )

                return !!link ? (
                  <Link
                    key={index}
                    className={itemWrapperClass}
                    href={link}
                    target={!!isExternal ? '_blank' : ''}
                    rel="noopener noreferrer"
                    onClick={toggleIsMenuOpen}
                  >
                    {itemContent}
                  </Link>
                ) : (
                  <Accordion
                    key={index}
                    type="single"
                    className="w-full"
                    collapsible
                  >
                    <AccordionItem value={`item-${index}`}>
                      <AccordionTrigger className={itemWrapperClass}>
                        {itemContent}
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col p-0 pb-2">
                        {children?.map(
                          (
                            {
                              label: cLabel,
                              labelKey: cLabelKey,
                              link: cLink,
                              isExternal: cIsExternal,
                            },
                            cIndex,
                          ) => (
                            <Link
                              key={`${index}-${cIndex}`}
                              className={cn(
                                'whitespace-nowrap rounded-lg p-3 pl-16 text-base',
                                generatePath(cLink, { params } as any) ===
                                  pathname && '!text-primary',
                              )}
                              href={cLink}
                              target={!!cIsExternal ? '_blank' : ''}
                              rel="noopener noreferrer"
                              onClick={toggleIsMenuOpen}
                            >
                              {!!cLabelKey ? t(cLabelKey) : cLabel}
                            </Link>
                          ),
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              },
            )}
          </div>

          <div className="flex-c w-full shrink-0 py-3">
            <SocialLinksWrapper />
          </div>
        </div>
      </div>
    </div>
  )
}
