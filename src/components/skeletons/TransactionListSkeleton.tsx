import { Skeleton } from '@/components/ui/skeleton';

interface TransactionListSkeletonProps {
  count?: number;
  showDateHeader?: boolean;
  showSearchBar?: boolean;
  showTabs?: boolean;
}

export function TransactionListSkeleton({ 
  count = 4, 
  showDateHeader = true,
  showSearchBar = false,
  showTabs = false 
}: TransactionListSkeletonProps) {
  return (
    <div>
      {/* Search bar skeleton */}
      {showSearchBar && (
        <div className="relative mb-3">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      )}

      {/* Tabs skeleton */}
      {showTabs && (
        <div className="mb-4">
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg h-9">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={`flex-1 h-7 rounded-md ${i === 0 ? 'bg-background' : ''}`} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Transaction list skeleton */}
      <div className="space-y-6">
        {showDateHeader && (
          <Skeleton className="h-4 w-24 mb-3" />
        )}
        <div className="space-y-1.5">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="card-elevated p-3 flex items-center justify-between"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-12" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
