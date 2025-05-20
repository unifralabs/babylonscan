'use client'

import { useTheme } from 'next-themes'
import ReactJson, { type ReactJsonViewProps } from 'react-json-view'

import { cn, getAppResolvedTheme } from '@cosmoscan/shared/utils'

export interface JsonViewerProps extends ReactJsonViewProps {
  className?: string
}

export default function JsonViewer({ className, ...props }: JsonViewerProps) {
  const { resolvedTheme } = useTheme()

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <ReactJson
        style={{
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)',
          backgroundColor: 'transparent !important',
        }}
        name={null}
        displayDataTypes={false}
        theme={
          getAppResolvedTheme(resolvedTheme) === 'light'
            ? 'summerfruit:inverted'
            : 'monokai'
        }
        {...props}
      />
    </div>
  )
}

export function ApiResponseJsonViewer({
  className,
  ...props
}: JsonViewerProps) {
  return (
    <div className={className}>
      <JsonViewer name={null} displayDataTypes={false} {...props} />
    </div>
  )
}
