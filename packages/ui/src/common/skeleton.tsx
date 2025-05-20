import { cn } from '@cosmoscan/shared/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-border/10 animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
