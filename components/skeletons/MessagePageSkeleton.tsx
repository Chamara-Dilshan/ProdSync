import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MessagePageSkeleton(): React.JSX.Element {
  return (
    <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
      {/* Input Section */}
      <div className="space-y-4 md:space-y-6">
        {/* Buyer Message Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Message textarea */}
            <Skeleton className="h-32 w-full" />

            {/* Product selector */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Tone selector */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Generate button */}
            <Skeleton className="h-11 w-full" />
          </CardContent>
        </Card>

        {/* Context Info Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <div>
        <Card className="h-full min-h-[300px]">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reply content */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Provider info */}
            <div className="pt-4 border-t space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
