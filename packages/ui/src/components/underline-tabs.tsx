'use client'

import { useEffect, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/tabs'

import { cn } from '@cosmoscan/shared/utils'

export interface UnderlineTabsProps {
  classNames?: {
    root?: string
    list?: string
    trigger?: string
    content?: string
  }
  activeTab?: string
  setActiveTab?: (tab: string) => void
  onValueChange?: (value: string) => void
  tabs: {
    value: string
    valueContent: React.ReactNode
    content?: React.ReactNode
  }[]
  disabled?: boolean
  variant?: 'underlined' | 'solid'
}

export default function DataTabs({
  classNames,
  activeTab,
  setActiveTab,
  onValueChange,
  tabs,
  disabled = false,
  variant = 'underlined',
}: UnderlineTabsProps) {
  const validateActiveTab = tabs.some(tab => tab.value === activeTab)
    ? activeTab
    : tabs[0].value
  const [currentTab, setCurrentTab] = useState(
    validateActiveTab || tabs[0].value,
  )

  useEffect(() => {
    !!validateActiveTab && setCurrentTab(validateActiveTab)
  }, [validateActiveTab])

  return (
    <Tabs
      className={cn('w-full overflow-auto', classNames?.root)}
      value={currentTab}
      onValueChange={value => {
        setCurrentTab(value)
        setActiveTab?.(value)
        onValueChange?.(value)
      }}
    >
      <TabsList
        className={cn('!md:p-0 !h-fit !bg-transparent pb-2', classNames?.list)}
      >
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            className={cn(
              'underlined' === variant &&
                'data-[state=active]:text-primary data-[state=active]:border-b-primary !md:px-6 !md:pb-4 !md:pt-2 !mr-10 min-w-16 shrink-0 justify-start rounded-none !bg-transparent !px-0 !pb-2 !pt-1 text-base data-[state=active]:border-b-[1.5px] md:min-w-32 md:justify-center',
              'solid' === variant && 'bg-secondary w-fit !py-2',
              classNames?.trigger,
            )}
            value={tab.value}
            disabled={disabled}
          >
            {tab.valueContent}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent
          key={tab.value}
          className={classNames?.content}
          value={tab.value}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
