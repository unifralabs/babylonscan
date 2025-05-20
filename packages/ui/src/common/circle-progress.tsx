import { cn } from '@cosmoscan/shared/utils'

export interface CircleProgressProps {
  className?: string
  value?: number
}

export default function CircleProgress({
  className,
  value,
}: CircleProgressProps) {
  const perimeter = Math.PI * 2 * 13
  const strokeDashoffset = perimeter - (perimeter * (value ?? 0)) / 100

  return (
    <svg
      className={cn(
        'text-primary relative z-0 h-10 w-10 overflow-hidden stroke-[4px]',
        className,
      )}
      viewBox="0 0 32 32"
      fill="none"
    >
      <circle
        className="stroke-foreground/25 h-full"
        cx="16"
        cy="16"
        r="13"
        strokeDasharray={`${perimeter} ${perimeter}`}
        strokeDashoffset="0"
        transform="rotate(-90 16 16)"
        strokeLinecap="round"
      ></circle>
      <circle
        className="h-full stroke-current transition-all !duration-500"
        cx="16"
        cy="16"
        r="13"
        strokeDasharray={`${perimeter} ${perimeter}`}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 16 16)"
        strokeLinecap="round"
      ></circle>
    </svg>
  )
}
