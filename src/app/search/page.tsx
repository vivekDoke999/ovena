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

  // Smart search mapping
  const normalizePropertyType = (type: string): string => {
    const t = type.toLowerCase().trim();
    if (['apartment', 'apartments', 'flat', 'flats', 'appartment', 'residential apartment'].includes(t)) return 'APARTMENT';
    if (['house', 'houses', 'home', 'homes', 'independent house', 'independent home'].includes(t)) return 'HOUSE';
    if (['villa', 'villas', 'independent villa'].includes(t)) return 'VILLA';
    if (['bungalow', 'bungalows', 'banglow', 'banglows'].includes(t)) return 'BUNGALOW';
    if (['builder floor', 'builder-floor', 'floor', 'independent floor'].includes(t)) return 'OTHER';
    if (['room', 'rooms', 'single room', 'private room'].includes(t)) return 'ROOM';
    if (['pg', 'paying guest', 'paying guest room', 'pg room', 'co living', 'co-living', 'coliving', 'shared living'].includes(t)) return 'PG';
    return type.toUpperCase(); // Fallback to DB enum format
  };

  if (property_type) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query = query.eq('property_type', normalizePropertyType(property_type) as any);
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
    <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 gap-8 bg-background">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-[280px] shrink-0">
        <MobileFilterWrapper>
          <form className="bg-surface p-6 rounded-2xl shadow-sm border border-border md:sticky md:top-24" method="GET">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg text-foreground">Filters</h2>
              <NearMeButton />
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">City</label>
                <input type="text" name="city" defaultValue={city} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Mumbai" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Locality</label>
                <input type="text" name="locality" defaultValue={locality} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Bandra" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amenity</label>
                <input type="text" name="amenity" defaultValue={amenity} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Parking" />
              </div>

              <div className="h-px bg-border my-2"></div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Furnishing</label>
                <select name="furnishing" defaultValue={furnishing} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="UNFURNISHED">Unfurnished</option>
                  <option value="SEMI_FURNISHED">Semi Furnished</option>
                  <option value="FULLY_FURNISHED">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Property Type</label>
                <select name="property_type" defaultValue={property_type} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="PG">PG</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Min Rent</label>
                  <input type="number" name="min_rent" defaultValue={min_rent} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="₹0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Max Rent</label>
                  <input type="number" name="max_rent" defaultValue={max_rent} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Any" />
                </div>
              </div>

              <div className="h-px bg-border my-2"></div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bedrooms</label>
                <select name="bedrooms" defaultValue={bedrooms} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Sort By</label>
                <select name="sort" defaultValue={sort} className="w-full px-3 py-2 border border-border bg-background rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-[10px] font-medium hover:bg-primary-hover transition mt-4">
                Apply Filters
              </button>
            </div>
          </form>
        </MobileFilterWrapper>
      </aside>

      {/* Results */}
      <section className="flex-1 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-medium text-foreground">Explore Properties</h1>
            <p className="text-text-secondary mt-1">{count || 0} homes available</p>
          </div>
        </div>
        
        {error ? (
          <div className="bg-red-50 text-error p-4 rounded-xl border border-red-100">
            Error loading properties. Please try again.
          </div>
        ) : (!properties || properties.length === 0) ? (
          <div className="text-center py-32 bg-surface rounded-2xl border border-border flex flex-col items-center justify-center shadow-sm">
            <svg className="w-16 h-16 text-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-medium text-foreground mb-2">No properties found</h3>
            <p className="text-text-secondary max-w-md">Try adjusting your filters or searching in a different locality to see more results.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 mb-12">
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
              <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-border">
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
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-surface text-foreground transition-colors"
                  >
                    &larr; Previous
                  </a>
                )}
                
                <span className="text-sm font-medium text-text-secondary px-4">
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
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-surface text-foreground transition-colors"
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
