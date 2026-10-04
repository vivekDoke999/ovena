import { createClient } from '@/lib/supabase/server';
import PropertyCard from '@/components/properties/PropertyCard';
import NearMeButton from '@/components/properties/NearMeButton';
import { MobileFilterWrapper } from './MobileFilterWrapper';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const city = params.city as string | undefined;
  const locality = params.locality as string | undefined;
  const property_type = params.property_type as string | undefined;
  const furnishing = params.furnishing as string | undefined;
  const min_rent = params.min_rent as string | undefined;
  const max_rent = params.max_rent as string | undefined;
  const bedrooms = params.bedrooms as string | undefined;
  const sort = params.sort as string | undefined;
  const page = params.page ? parseInt(params.page as string) : 1;
  const limit = 24;
  
  const lat = params.lat ? parseFloat(params.lat as string) : undefined;
  const lng = params.lng ? parseFloat(params.lng as string) : undefined;

  const amenity = params.amenity as string | undefined;

  let selectStr = `
    *,
    property_images (
      image_url
    )
  `;

  if (amenity) {
    selectStr += `, property_amenities!inner(amenities!inner(name))`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('properties')
    .select(selectStr, { count: 'exact' })
    .eq('status', 'AVAILABLE')
    .eq('verification_status', 'VERIFIED');

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }
  if (locality) {
    query = query.ilike('locality', `%${locality}%`);
  }
  
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    // Rough bounding box for ~15km radius (approx 0.15 degrees)
    const delta = 0.15;
    query = query
      .gte('latitude', lat - delta)
      .lte('latitude', lat + delta)
      .gte('longitude', lng - delta)
      .lte('longitude', lng + delta);
  }

  if (property_type) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.eq('property_type', property_type as any);
  }
  if (furnishing) {
    query = query.eq('furnishing_status', furnishing);
  }
  if (amenity) {
    // We join the property_amenities and amenities table to check if it exists
    query = query.eq('property_amenities.amenities.name', amenity);
  }
  if (min_rent) {
    query = query.gte('rent_amount', parseInt(min_rent));
  }
  if (max_rent) {
    query = query.lte('rent_amount', parseInt(max_rent));
  }
  if (bedrooms) {
    query = query.eq('bedrooms', parseInt(bedrooms));
  }

  // Sorting
  if (sort === 'price_asc') {
    query = query.order('rent_amount', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('rent_amount', { ascending: false });
  } else {
    // Default newest
    query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: properties, count, error } = await query;
  const totalPages = count ? Math.ceil(count / limit) : 1;

  const signedUrlMap: Record<string, string> = {};
  if (properties && properties.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePaths = properties.map((p: any) => p.property_images?.[0]?.image_url).filter(Boolean);
    if (imagePaths.length > 0) {
      const { data } = await supabase.storage.from('property-images').createSignedUrls(imagePaths, 3600);
      if (data) {
        data.forEach((item) => {
          if (item.signedUrl && item.path) signedUrlMap[item.path] = item.signedUrl;
        });
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <MobileFilterWrapper>
          <form className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:sticky md:top-24" method="GET">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filters</h2>
              <NearMeButton />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city" defaultValue={city} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Mumbai" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                <input type="text" name="locality" defaultValue={locality} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Bandra" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenity</label>
                <input type="text" name="amenity" defaultValue={amenity} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Parking" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                <select name="furnishing" defaultValue={furnishing} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select name="property_type" defaultValue={property_type} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="PG">PG</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Rent</label>
                  <input type="number" name="min_rent" defaultValue={min_rent} className="w-full px-3 py-2 border rounded-md" placeholder="₹0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Rent</label>
                  <input type="number" name="max_rent" defaultValue={max_rent} className="w-full px-3 py-2 border rounded-md" placeholder="Any" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select name="bedrooms" defaultValue={bedrooms} className="w-full px-3 py-2 border rounded-md">
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select name="sort" defaultValue={sort} className="w-full px-3 py-2 border rounded-md">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-2 rounded-md font-medium hover:bg-primary-hover transition">
                Apply Filters
              </button>
            </div>
          </form>
        </MobileFilterWrapper>
      </aside>

      {/* Results */}
      <section className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Properties ({count || 0})</h1>
        
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            Error loading properties. Please try again.
          </div>
        ) : (!properties || properties.length === 0) ? (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 max-w-md">Try adjusting your filters or searching in a different locality to see more results.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {properties.map((property: any) => {
                const imgPath = property.property_images?.[0]?.image_url;
                const signedUrl = imgPath ? signedUrlMap[imgPath] : undefined;
                return (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    imageUrl={signedUrl} 
                  />
                );
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <a 
                    href={`/search?${new URLSearchParams({
                      ...(city && { city }),
                      ...(locality && { locality }),
                      ...(property_type && { property_type }),
                      ...(furnishing && { furnishing }),
                      ...(amenity && { amenity }),
                      ...(min_rent && { min_rent }),
                      ...(max_rent && { max_rent }),
                      ...(bedrooms && { bedrooms }),
                      ...(sort && { sort }),
                      ...(lat !== undefined && { lat: lat.toString() }),
                      ...(lng !== undefined && { lng: lng.toString() }),
                      page: (page - 1).toString()
                    }).toString()}`}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    &larr; Previous
                  </a>
                )}
                
                <span className="text-sm font-medium text-gray-600 px-4">
                  Page {page} of {totalPages}
                </span>

                {page < totalPages && (
                  <a 
                    href={`/search?${new URLSearchParams({
                      ...(city && { city }),
                      ...(locality && { locality }),
                      ...(property_type && { property_type }),
                      ...(furnishing && { furnishing }),
                      ...(amenity && { amenity }),
                      ...(min_rent && { min_rent }),
                      ...(max_rent && { max_rent }),
                      ...(bedrooms && { bedrooms }),
                      ...(sort && { sort }),
                      ...(lat !== undefined && { lat: lat.toString() }),
                      ...(lng !== undefined && { lng: lng.toString() }),
                      page: (page + 1).toString()
                    }).toString()}`}
                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50"
                  >
                    Next &rarr;
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
