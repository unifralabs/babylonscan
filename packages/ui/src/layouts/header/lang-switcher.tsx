'use client'

import { Button } from '../../common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../common/dropdown-menu'
import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'

import { setCookieLocale } from '@cosmoscan/core/i18n'
import { localeOptions } from '@cosmoscan/core/i18n/config'
import { cn } from '@cosmoscan/shared/utils'

export default function LangSwitcher() {
  const locale = useLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex-c bg-background text-foreground hover:bg-background/90 size-7 shrink-0 p-0 md:size-9"
          size="icon"
        >
          <Globe className="!size-[14px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-7">
        {localeOptions.map(({ label, value }) => (
          <DropdownMenuItem
            className={cn(
              'flex-c capitalize',
              value === locale && '!text-primary',
            )}
            key={value}
            onClick={() => setCookieLocale(value)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
