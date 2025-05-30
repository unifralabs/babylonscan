'use client'

import * as React from 'react'

import * as SwitchPrimitives from '@radix-ui/react-switch'

import { cn } from '@cosmoscan/shared/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'data-[state=checked]:bg-foreground/30 border-foreground bg-background data-[state=unchecked]:bg-background peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'bg-foreground/80 pointer-events-none ml-px block h-4 w-4 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
