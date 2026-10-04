import { createClient } from '@/lib/supabase/server';
import PropertyCard from '@/components/properties/PropertyCard';
import NearMeButton from '@/components/properties/NearMeButton';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured properties
  const { data: properties } = await (supabase
    .from('properties')
    .select(`
      *,
      property_images (
        image_url
      )
    `)
    .eq('status', 'AVAILABLE')
    .eq('verification_status', 'VERIFIED')
    .order('created_at', { ascending: false })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .limit(6) as any);

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
    <main className="flex-1 flex flex-col bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-4 max-w-4xl">
          Find a place. <span className="text-primary italic">Deal directly.</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-2xl font-light">
          A premium rental marketplace connecting verified property owners directly with renters. Zero middlemen, complete transparency.
        </p>
        
        {/* Comprehensive Search Bar */}
        <form action="/search" className="w-full max-w-4xl bg-surface p-3 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row gap-2 transition-shadow hover:shadow-md">
          <div className="flex-1 flex flex-col items-start px-4 py-2 border-b md:border-b-0 md:border-r border-border hover:bg-gray-50 rounded-lg transition-colors cursor-text">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Where?</label>
            <input 
              type="text" 
              name="city"
              placeholder="City, locality, or landmark"
              className="w-full bg-transparent outline-none text-foreground font-medium placeholder:font-normal placeholder:text-text-muted text-sm md:text-base"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-start px-4 py-2 border-b md:border-b-0 md:border-r border-border hover:bg-gray-50 rounded-lg transition-colors cursor-pointer relative">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Property Type</label>
            <select name="property_type" className="w-full bg-transparent outline-none text-foreground font-medium appearance-none cursor-pointer text-sm md:text-base">
              <option value="">Any Type</option>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="VILLA">Villa</option>
              <option value="PG">PG</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col items-start px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-text">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">Budget</label>
            <input 
              type="number" 
              name="max_rent"
              placeholder="₹ Maximum rent"
              className="w-full bg-transparent outline-none text-foreground font-medium placeholder:font-normal placeholder:text-text-muted text-sm md:text-base"
            />
          </div>
          
          <div className="flex items-center gap-2 pl-2 pr-1 py-2">
            <NearMeButton />
            <button type="submit" className="bg-primary text-white px-8 py-4 rounded-xl font-medium hover:bg-primary-hover transition-colors shadow-sm flex items-center justify-center h-full">
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-2">Featured Rentals</h2>
            <p className="text-text-secondary">Discover verified homes ready to move in.</p>
          </div>
          <Link href="/search" className="hidden sm:block text-primary font-medium hover:text-primary-hover transition-colors">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {(!properties || properties.length === 0) ? (
            <div className="col-span-full py-20 text-center text-text-muted bg-surface rounded-2xl border border-border flex flex-col items-center justify-center">
              <svg className="w-12 h-12 text-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-1">No featured properties</h3>
              <p>Check back later or explore available homes.</p>
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            properties.map((property: any) => {
              const imgPath = property.property_images?.[0]?.image_url;
              const signedUrl = imgPath ? signedUrlMap[imgPath] : undefined;

              return (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  imageUrl={signedUrl} 
                />
              );
            })
          )}
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Link href="/search" className="inline-block border border-border bg-surface text-foreground px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            View All Properties
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-surface py-20 px-6 md:px-12 border-t border-border mt-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4">The OVENA Standard</h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg font-light">We cut out the middlemen to provide a transparent, trusted, and premium rental experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-background border border-border text-primary rounded-2xl flex items-center justify-center mb-6 text-xl font-medium shadow-sm">1</div>
              <h3 className="text-lg font-medium text-foreground mb-3">Verified Listings</h3>
              <p className="text-text-secondary leading-relaxed">Every property and host on our platform goes through a strict verification process by our admin team before going live.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-background border border-border text-primary rounded-2xl flex items-center justify-center mb-6 text-xl font-medium shadow-sm">2</div>
              <h3 className="text-lg font-medium text-foreground mb-3">Zero Brokerage</h3>
              <p className="text-text-secondary leading-relaxed">Connect directly with owners. No hidden fees, no unnecessary commissions. Just straightforward renting as it should be.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-background border border-border text-primary rounded-2xl flex items-center justify-center mb-6 text-xl font-medium shadow-sm">3</div>
              <h3 className="text-lg font-medium text-foreground mb-3">Direct Contact</h3>
              <p className="text-text-secondary leading-relaxed">Use our built-in enquiry system to safely communicate and share details without exposing your personal info upfront.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-border py-12 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-foreground tracking-tighter">OVENA.</div>
          <p className="text-sm text-text-muted">© {new Date().getFullYear()} OVENA. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
