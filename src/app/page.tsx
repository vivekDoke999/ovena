import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import PropertyCard from '@/components/properties/PropertyCard';

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch a small batch of featured/recommended properties
  const { data: properties } = await supabase
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
    .limit(6);

  // Fetch property_type counts
  const { data: categoriesData } = await supabase
    .from('properties')
    .select('property_type')
    .eq('status', 'AVAILABLE');

  const counts: Record<string, number> = {};
  if (categoriesData) {
    categoriesData.forEach(p => {
      counts[p.property_type] = (counts[p.property_type] || 0) + 1;
    });
  }

  // Pre-sign URLs for the featured properties
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

  const propertyTypes = [
    { label: 'Apartments', type: 'APARTMENT', count: counts['APARTMENT'] || 0, img: '/images/property-types/apartments.jpg' },
    { label: 'Independent Houses', type: 'HOUSE', count: counts['HOUSE'] || 0, img: '/images/property-types/independent-houses.jpg' },
    { label: 'Villas & Bungalows', type: 'VILLA', count: (counts['VILLA'] || 0) + (counts['BUNGALOW'] || 0), img: '/images/property-types/villas-bungalows.jpg' },
    { label: 'Builder Floors', type: 'OTHER', count: counts['OTHER'] || 0, img: '/images/property-types/builder-floors.jpg' },
    { label: 'Rooms', type: 'ROOM', count: counts['ROOM'] || 0, img: '/images/property-types/rooms.jpg' },
    { label: 'PG & Co-living', type: 'PG', count: counts['PG'] || 0, img: '/images/property-types/pg-coliving.jpg' }
  ];

  const popularLocations = [
    { name: 'Mumbai', img: '/images/locations/mumbai.jpg' },
    { name: 'Bengaluru', img: '/images/locations/bengaluru.jpg' },
    { name: 'Delhi NCR', img: '/images/locations/delhi.jpg' },
    { name: 'Pune', img: '/images/locations/pune.jpg' },
    { name: 'Hyderabad', img: '/images/locations/hyderabad.jpg' },
    { name: 'Ahmedabad', img: '/images/locations/ahmedabad.jpg' }
  ];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-16 md:pt-24 pb-32 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 z-10">
          <div className="inline-block text-[11px] font-bold tracking-[0.15em] text-primary uppercase mb-6 bg-primary-soft px-3 py-1.5 rounded-full">
            INDIA&apos;S DIRECT RENTAL MARKETPLACE
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-medium text-foreground tracking-tight leading-[1.1] mb-6">
            Find a place.<br />
            <span className="text-text-secondary">Deal directly.</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-xl leading-relaxed">
            Quality rentals across Indian cities, directly from hosts.
          </p>
        </div>
        
        <div className="flex-1 w-full lg:w-auto relative">
          <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-section-alt relative">
            <Image 
              src="/images/hero/hero-home.jpg" 
              alt="Modern apartment interior" 
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover" 
              priority
            />
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute left-6 right-6 md:left-12 md:right-12 lg:left-12 -bottom-8 lg:right-auto z-20 max-w-[950px] w-full">
          <form action="/search" className="bg-surface p-2 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col md:flex-row gap-0 items-stretch w-full">
            <div className="flex-1 flex flex-col items-start px-5 py-3 md:border-r border-border hover:bg-section-alt rounded-xl transition-colors cursor-text">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Where</label>
              <input 
                type="text" 
                name="city"
                placeholder="City / locality / landmark"
                className="w-full bg-transparent outline-none text-foreground font-medium placeholder:font-normal placeholder:text-text-muted text-[15px]"
              />
            </div>
            
            <div className="flex-1 flex flex-col items-start px-5 py-3 md:border-r border-border hover:bg-section-alt rounded-xl transition-colors cursor-pointer">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Property Type</label>
              <select name="property_type" className="w-full bg-transparent outline-none text-foreground font-medium appearance-none cursor-pointer text-[15px]">
                <option value="">Apartment / House / Villa / Room / PG</option>
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">Independent House</option>
                <option value="VILLA">Villa</option>
                <option value="ROOM">Room</option>
                <option value="PG">PG &amp; Co-living</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col items-start px-5 py-3 md:border-r border-border hover:bg-section-alt rounded-xl transition-colors cursor-pointer">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Budget</label>
              <select name="max_rent" className="w-full bg-transparent outline-none text-foreground font-medium appearance-none cursor-pointer text-[15px]">
                <option value="">Maximum monthly rent</option>
                <option value="15000">Up to ₹15,000</option>
                <option value="25000">Up to ₹25,000</option>
                <option value="40000">Up to ₹40,000</option>
                <option value="60000">Up to ₹60,000</option>
                <option value="100000">Up to ₹1,00,000</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col items-start px-5 py-3 md:border-r border-border hover:bg-section-alt rounded-xl transition-colors cursor-pointer">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">BHK</label>
              <select name="bhk" className="w-full bg-transparent outline-none text-foreground font-medium appearance-none cursor-pointer text-[15px]">
                <option value="">1 / 2 / 3 / 4+</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4+ BHK</option>
              </select>
            </div>
            
            <div className="flex items-center p-2 gap-2">
              <button type="button" className="bg-surface border border-border text-foreground px-4 py-3.5 rounded-xl font-medium hover:bg-section-alt transition-colors h-full flex items-center justify-center whitespace-nowrap text-[14px]">
                Near Me
              </button>
              <button type="submit" className="bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-hover transition-colors h-full flex items-center justify-center min-w-[120px] text-[15px]">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Property Types */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <h2 className="text-[22px] md:text-[24px] font-medium text-foreground mb-1">Explore properties by type</h2>
        <p className="text-text-secondary text-[15px] mb-8">Find the kind of home that fits your needs.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {propertyTypes.map((cat) => (
            <Link key={cat.label} href={`/search?property_type=${cat.type}`} className="group flex flex-col gap-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-section-alt relative">
                <Image src={cat.img} alt={cat.label} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              </div>
              <div>
                <h3 className="text-[15px] font-medium text-foreground">{cat.label}</h3>
                <p className="text-[13px] text-text-secondary">{cat.count > 0 ? `${cat.count} properties` : 'No listings yet'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <h2 className="text-[22px] md:text-[24px] font-medium text-foreground mb-8">Explore popular locations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularLocations.map((city) => (
            <Link key={city.name} href={`/search?city=${encodeURIComponent(city.name)}`} className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent transition-colors z-10"></div>
              <Image src={city.img} alt={city.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw" className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-white font-medium text-[15px]">{city.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Rentals */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[22px] md:text-[24px] font-medium text-foreground mb-1">Recommended rentals</h2>
            <p className="text-text-secondary text-[15px]">Homes worth a closer look.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {(!properties || properties.length === 0) ? (
            <div className="col-span-full py-20 text-center text-text-muted bg-surface rounded-xl border border-border flex flex-col items-center justify-center">
              <p>No featured properties at the moment.</p>
            </div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            properties.map((property: any) => {
              const imgPath = property.property_images?.[0]?.image_url;
              const signedUrl = imgPath ? signedUrlMap[imgPath] : undefined;
              return <PropertyCard key={property.id} property={property} imageUrl={signedUrl} />;
            })
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 md:px-12 mt-8">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-[22px] md:text-[24px] font-medium text-foreground mb-12">Why OVENA?</h2>
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mb-5 border border-border">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 className="text-[16px] font-medium text-foreground mb-2">Direct conversations</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Speak directly with property owners. No middlemen or unnecessary friction.</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mb-5 border border-border">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[16px] font-medium text-foreground mb-2">Verified listings</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Every host and property is thoroughly checked before going live on our platform.</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mb-5 border border-border">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 className="text-[16px] font-medium text-foreground mb-2">Transparent details</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Clear breakdown of rent, deposit, and maintenance. No hidden surprises.</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center mb-5 border border-border">
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-[16px] font-medium text-foreground mb-2">Simple enquiry</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">Send enquiries with one click and track your applications easily from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Host CTA */}
      <section className="py-24 px-6 md:px-12 bg-section-alt">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-medium text-foreground mb-4">Have a property to rent?</h2>
          <p className="text-[16px] text-text-secondary mb-8">List it on OVENA and connect directly with quality renters. Control your pricing and manage enquiries seamlessly.</p>
          <Link href="/host" className="inline-block bg-primary text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-hover transition-colors">
            List your property
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-section-alt border-t border-border pt-16 pb-8 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-[22px] font-semibold text-foreground tracking-tight flex items-center">
                OVENA<span className="w-1.5 h-1.5 rounded-full bg-accent ml-1 mb-1 block"></span>
              </span>
            </div>
            <p className="text-[14px] text-text-secondary">Find a place. Deal directly.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="text-[14px] font-medium text-foreground mb-1">Explore</h4>
              <Link href="/search" className="text-[14px] text-text-secondary hover:text-foreground">Properties</Link>
              <Link href="/search?property_type=APARTMENT" className="text-[14px] text-text-secondary hover:text-foreground">Apartments</Link>
              <Link href="/search?property_type=HOUSE" className="text-[14px] text-text-secondary hover:text-foreground">Houses</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[14px] font-medium text-foreground mb-1">Locations</h4>
              <Link href="/search?city=Mumbai" className="text-[14px] text-text-secondary hover:text-foreground">Mumbai</Link>
              <Link href="/search?city=Bengaluru" className="text-[14px] text-text-secondary hover:text-foreground">Bengaluru</Link>
              <Link href="/search?city=Delhi%20NCR" className="text-[14px] text-text-secondary hover:text-foreground">Delhi NCR</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[14px] font-medium text-foreground mb-1">Hosts</h4>
              <Link href="/host" className="text-[14px] text-text-secondary hover:text-foreground">List your property</Link>
              <Link href="/host" className="text-[14px] text-text-secondary hover:text-foreground">Host Dashboard</Link>
              <Link href="/login" className="text-[14px] text-text-secondary hover:text-foreground">Login</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[14px] font-medium text-foreground mb-1">Support</h4>
              <a href="#" className="text-[14px] text-text-secondary hover:text-foreground">Help Center</a>
              <a href="#" className="text-[14px] text-text-secondary hover:text-foreground">Trust & Safety</a>
              <a href="#" className="text-[14px] text-text-secondary hover:text-foreground">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[13px] text-text-muted">© {new Date().getFullYear()} OVENA. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
