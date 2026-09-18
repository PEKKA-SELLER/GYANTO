// Pulse animation skeleton block
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
)

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <div className="glass-card overflow-hidden flex flex-col">
    <Skeleton className="w-full aspect-[3/4] rounded-none" />
    <div className="p-5 flex flex-col gap-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
  </div>
)

// Product Detail Skeleton
export const ProductDetailSkeleton = () => (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <Skeleton className="h-5 w-32 mb-8" />
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-2">
        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
      </div>
      <div className="lg:col-span-3 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      </div>
    </div>
  </div>
)

export default Skeleton
