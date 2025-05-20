'use client'

import { createElement } from 'react'

import { Button } from '../common/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../common/dropdown-menu'
import { MoonStar, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { SUPPORTED_THEME } from '@cosmoscan/shared/constants/common'
import useIsClient from '@cosmoscan/shared/hooks/use-is-client'

const themes = ['light', 'dark', 'system']

export default function ThemeSwitcher() {
  const isClient = useIsClient()
  const { resolvedTheme, setTheme } = useTheme()

  return 'all' === SUPPORTED_THEME ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex-c bg-background text-foreground hover:bg-background/90 size-7 shrink-0 p-0 md:size-9"
          size="icon"
        >
          {isClient &&
            createElement(resolvedTheme === 'light' ? Sun : MoonStar, {
              className: '!size-[14px]',
            })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-7">
        {themes.map(theme => (
          <DropdownMenuItem
            className="flex-c capitalize"
            key={theme}
            onClick={() => setTheme(theme)}
          >
            {theme}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null
}
