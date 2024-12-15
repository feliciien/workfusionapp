import { Card } from "@/components/ui/card";

export default function LoadingSkeleton() {
  return (
    <div className="flex-1 p-8 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>

      {/* Search and Stats Skeleton */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 col-span-2">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
          </div>
        </Card>
      </div>

      {/* Tools Grid Skeleton */}
      <div className="space-y-8">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((card) => (
                <Card key={card} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
