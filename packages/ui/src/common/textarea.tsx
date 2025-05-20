import * as React from 'react'

import { cn } from '@cosmoscan/shared/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  resizable?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, resizable = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'bg-card placeholder:text-foreground/50 border-border-light flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          !resizable && 'resize-none',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
