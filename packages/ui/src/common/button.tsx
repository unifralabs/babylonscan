import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'

import { cn } from '@cosmoscan/shared/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-border bg-background hover:bg-accent hover:text-accent-foreground border',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outlineGhost:
          'border-primary text-primary hover:bg-primary hover:text-primary-foreground border',
        secondaryOutlineGhost:
          'border-foreground text-foreground hover:bg-foreground hover:text-primary-foreground border',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'svg:h-5 h-10 px-4 py-2 [&>svg]:size-3.5',
        sm: 'h-9 rounded-md px-3 text-sm [&>svg]:size-3',
        lg: 'h-11 rounded-md px-8 text-lg [&>svg]:size-3.5',
        xl: 'h-14 rounded-md px-10 text-xl [&>svg]:size-5',
        icon: 'h-10 w-10 [&>svg]:size-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'flex-items-c gap-2.5',
          buttonVariants({ variant, size, className }),
        )}
        ref={ref}
        {...props}
        disabled={isLoading || !!props?.disabled}
      >
        {isLoading && <LoaderCircle className="animate-spin" />}
        {(size !== 'icon' || (size === 'icon' && !isLoading)) && props.children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
