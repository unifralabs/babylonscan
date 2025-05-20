import { Card } from '@cosmoscan/ui/card'
import { Separator } from '@cosmoscan/ui/separator'
import { Skeleton } from '@cosmoscan/ui/skeleton'

export default function Loading() {
  return (
    <Card className="p-gap">
      <div className="mb-6">
        <Skeleton className="mb-3 h-6 w-16" />
        <Skeleton className="mb-3 h-8 w-3/4" />
        <Skeleton className="h-6 w-64" />
      </div>

      <Separator className="mb-6 mt-2" />

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:gap-16">
        <div>
          <Skeleton className="mb-3 h-5 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div>
          <Skeleton className="mb-3 h-5 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="bg-secondary rounded-lg border p-5">
              <div className="mb-3 flex justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
          ))}
      </div>

      <div className="bg-secondary mt-8 rounded-lg p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </Card>
  )
}
