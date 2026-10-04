export default function SearchLoading() {
  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 gap-8">
      {/* Filters Skeleton */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Results Skeleton */}
      <section className="flex-1">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
