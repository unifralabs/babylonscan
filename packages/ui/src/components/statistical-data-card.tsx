import { createElement, ReactNode, Suspense } from 'react'

import { Card } from '../common/card'
import { Skeleton } from '../common/skeleton'

import { cn } from '@cosmoscan/shared/utils'

export interface StatisticalDataCardProps {
  classNames?: {
    item?: string
    label?: string
    value?: string
    icon?: string
  }
  icon: React.FunctionComponent<React.SVGAttributes<SVGElement>>
  label: ReactNode
  value: ReactNode
  subLabel1?: ReactNode
  subLabel2?: ReactNode
  subValue1?: ReactNode
  subValue2?: ReactNode
}

export default function StatisticalDataCard({
  classNames,
  icon,
  label,
  value,
  subLabel1,
  subLabel2,
  subValue1,
  subValue2,
}: StatisticalDataCardProps) {
  // Determine if we only have one set of subvalues
  const hasSubValues = (subLabel1 || subValue1) || (subLabel2 || subValue2);
  const hasBothSubValues = (subLabel1 || subValue1) && (subLabel2 || subValue2);
  const hasOnlyFirstSubValue = (subLabel1 || subValue1) && !(subLabel2 || subValue2);
  const hasOnlySecondSubValue = !(subLabel1 || subValue1) && (subLabel2 || subValue2);

  return (
    <Card className={cn('p-page-gap flex flex-col h-full', classNames?.item)}>
      <div className="flex gap-4 items-center mb-0">
        <div className="flex-1">
          <div
            className={cn(
              'text-foreground-secondary mb-4 whitespace-nowrap',
              classNames?.label,
            )}
          >
            {label}
          </div>
          <div className={cn('text-xl font-bold min-h-[24px]', classNames?.value)}>
            {value !== null && value !== undefined ? (
              <Suspense fallback={<Skeleton className="h-7 w-36" />}>
                {value}
              </Suspense>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </div>

        {icon && (
          <div className="flex-c bg-background h-12 w-12 shrink-0 rounded-full">
            {createElement(icon, { className: cn('h-6 w-6', classNames?.icon) })}
          </div>
        )}
      </div>

      {/* Add spacer if there are subvalues */}
      <div className={hasSubValues ? "flex-grow" : "pb-0"} />

      {/* Sub values in full width rows - only render if component parts exist */}
      {hasBothSubValues && (
        <>
          {subLabel1 && subValue1 && (
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">{subLabel1}:</div>
                <div className="text-sm font-bold">{subValue1}</div>
              </div>
            </div>
          )}
          {subLabel2 && subValue2 && (
            <div className="mt-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">{subLabel2}:</div>
                <div className="text-sm font-bold">{subValue2}</div>
              </div>
            </div>
          )}
        </>
      )}

      {hasOnlyFirstSubValue && subLabel1 && subValue1 && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{subLabel1}:</div>
            <div className="text-sm font-bold">{subValue1}</div>
          </div>
        </div>
      )}

      {hasOnlySecondSubValue && subLabel2 && subValue2 && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">{subLabel2}:</div>
            <div className="text-sm font-bold">{subValue2}</div>
          </div>
        </div>
      )}
    </Card>
  )
}

export function StatisticalDataCards({
  className,
  itemClassNames,
  items = [],
}: {
  className?: string
  itemClassNames?: StatisticalDataCardProps['classNames']
  items: Omit<StatisticalDataCardProps, 'classNames'>[]
}) {
  return (
    <div className={className}>
      {items.map((props, index) => (
        <StatisticalDataCard
          key={index}
          classNames={itemClassNames}
          {...props}
        />
      ))}
    </div>
  )
}
