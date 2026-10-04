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
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl">
          Find a place. <span className="text-primary">Deal directly.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">
          The premium rental marketplace connecting verified property owners directly with renters across India. Zero middlemen, complete transparency.
        </p>
        
        {/* Comprehensive Search Bar */}
        <form action="/search" className="w-full max-w-4xl bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex flex-col items-start border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</label>
              <input 
                type="text" 
                name="city"
                placeholder="City or Locality..."
                className="w-full bg-transparent outline-none text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex-1 flex flex-col items-start border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:px-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Property Type</label>
              <select name="property_type" className="w-full bg-transparent outline-none text-gray-900 font-medium appearance-none cursor-pointer">
                <option value="">Any Type</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="VILLA">Villa</option>
                <option value="PG">PG</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col items-start pb-4 md:pb-0 md:px-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Budget</label>
              <input 
                type="number" 
                name="max_rent"
                placeholder="₹ Any"
                className="w-full bg-transparent outline-none text-gray-900 font-medium placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
            <div className="w-full sm:w-auto">
              <NearMeButton />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-sm">
              Search Properties
            </button>
          </div>
        </form>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
            <p className="text-gray-600">Discover verified homes ready to move in.</p>
          </div>
          <Link href="/search" className="hidden sm:block text-primary font-medium hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {(!properties || properties.length === 0) ? (
            <div className="col-span-full py-16 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No featured properties</h3>
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
        <div className="mt-8 text-center sm:hidden">
          <Link href="/search" className="text-primary font-medium hover:underline">
            View All Properties &rarr;
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 px-6 md:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Deal Directly on OVENA?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We cut out the middlemen so you can enjoy a transparent, trusted, and premium rental experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">Verified Listings</h3>
              <p className="text-gray-600">Every property and host on our platform goes through a strict verification process by our admin team.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">Zero Brokerage</h3>
              <p className="text-gray-600">Connect directly with owners. No hidden fees, no unnecessary commissions. Just straight forward renting.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Secure Communication</h3>
              <p className="text-gray-600">Use our built-in enquiry system to safely communicate and share details without exposing your personal info upfront.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 md:px-12 text-center mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black text-white tracking-tighter">OVENA</div>
          <p className="text-sm">© {new Date().getFullYear()} OVENA. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
