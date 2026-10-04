import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { SaveButton, EnquiryForm, ReportButton } from '@/components/properties/PropertyActions';

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Verify auth for user state
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch property details, host profile, and amenities
  const { data: property, error } = await (supabase
    .from('properties')
    .select(`
      *,
      host:profiles!properties_host_id_fkey(first_name, last_name, created_at),
      property_images (image_url),
      property_amenities (
        amenities (name)
      )
    `)
    .eq('id', id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single() as any);

  if (error || !property) {
    notFound();
  }

  // Only expose VERIFIED and AVAILABLE properties unless the user is the host or admin
  const isHost = user?.id === property.host_id;
  
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'ADMIN';
  }

  if (property.status !== 'AVAILABLE' || property.verification_status !== 'VERIFIED') {
    if (!isHost && !isAdmin) {
      notFound();
    }
  }

  // Check if saved
  let isSaved = false;
  if (user) {
    const { data } = await supabase
      .from('saved_properties')
      .select('property_id')
      .match({ renter_id: user.id, property_id: property.id })
      .single();
    if (data) isSaved = true;
  }

  // Construct images
  // For production, using signedUrls. For now, let's assume we fetch them.
  const signedImages = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (property.property_images || []).map(async (img: any) => {
       const { data } = await supabase.storage.from('property-images').createSignedUrl(img.image_url, 3600);
       return data?.signedUrl;
    })
  );
  
  const images = signedImages.filter(Boolean) as string[];

  const amenities = property.property_amenities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.map((pa: any) => pa.amenities?.name)
    .filter(Boolean) || [];

  return (
    <main className="max-w-[1200px] mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full bg-background">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/5 text-primary border border-primary/20 px-2.5 py-1 rounded-[6px] text-xs font-semibold tracking-wider uppercase">
              {property.property_type}
            </span>
            {property.verification_status === 'VERIFIED' && (
               <span className="bg-success/10 text-success border border-success/20 px-2.5 py-1 rounded-[6px] text-xs font-semibold flex items-center gap-1 uppercase tracking-wider">
                 ✓ Verified
               </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">{property.title}</h1>
          <p className="text-text-secondary font-medium text-base md:text-lg">{property.locality}, {property.city}, {property.state} {property.zip_code}</p>
        </div>
        <div className="flex items-center gap-3">
           {user ? (
              <SaveButton propertyId={property.id} initialSaved={isSaved} />
           ) : (
             <a href="/login" className="px-4 py-2 rounded-[10px] font-medium border bg-surface text-foreground border-border hover:bg-gray-50 transition-colors shadow-sm">
               Log in to Save
             </a>
           )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-12 h-[50vh] min-h-[400px] rounded-2xl overflow-hidden">
         {images.length > 0 ? (
           <>
             <div className="md:col-span-2 md:row-span-2 relative bg-surface hover:opacity-95 transition-opacity cursor-pointer">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={images[0]} alt="Property Primary" className="w-full h-full object-cover" />
             </div>
             {images.slice(1, 5).map((src, idx) => (
               <div key={idx} className="relative bg-surface hidden md:block hover:opacity-95 transition-opacity cursor-pointer">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={src} alt={`Property ${idx+2}`} className="w-full h-full object-cover" />
               </div>
             ))}
           </>
         ) : (
           <div className="col-span-full flex flex-col items-center justify-center bg-surface border border-border text-text-muted">
             <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             No images available
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          
          <section className="flex flex-wrap gap-x-8 gap-y-6 py-8 border-y border-border">
             {property.bedrooms !== null && (
               <div className="flex flex-col">
                 <span className="font-semibold text-xl text-foreground">{property.bedrooms}</span>
                 <span className="text-text-secondary text-sm uppercase tracking-wide mt-1">Bedrooms</span>
               </div>
             )}
             {property.bathrooms !== null && (
               <div className="flex flex-col border-l pl-8 border-border">
                 <span className="font-semibold text-xl text-foreground">{property.bathrooms}</span>
                 <span className="text-text-secondary text-sm uppercase tracking-wide mt-1">Bathrooms</span>
               </div>
             )}
             {property.area_sqft !== null && (
               <div className="flex flex-col border-l pl-8 border-border">
                 <span className="font-semibold text-xl text-foreground">{property.area_sqft} <span className="text-sm font-medium">sqft</span></span>
                 <span className="text-text-secondary text-sm uppercase tracking-wide mt-1">Area</span>
               </div>
             )}
             {property.furnishing_status && (
               <div className="flex flex-col border-l pl-8 border-border">
                 <span className="font-semibold text-xl text-foreground capitalize">{property.furnishing_status.toLowerCase().replace('_', ' ')}</span>
                 <span className="text-text-secondary text-sm uppercase tracking-wide mt-1">Furnishing</span>
               </div>
             )}
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">About this property</h2>
            <div className="text-text-secondary whitespace-pre-wrap leading-relaxed text-lg font-light">
              {property.description}
            </div>
          </section>

          <section className="pt-6 border-t border-border">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-4">
              {amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 text-foreground font-medium">
                  <svg className="w-5 h-5 text-primary opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {amenity}
                </div>
              ))}
              {amenities.length === 0 && <div className="text-text-muted">Not specified</div>}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="relative">
          <div className="sticky top-28 bg-surface p-6 md:p-8 rounded-2xl border border-border shadow-sm">
             <div className="mb-8">
               <span className="text-3xl font-bold text-foreground">₹{property.rent_amount.toLocaleString('en-IN')}</span>
               <span className="text-text-secondary font-medium"> / month</span>
             </div>
             
             <div className="space-y-4 mb-8 text-sm border-y border-border py-6">
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary">Security Deposit</span>
                 <span className="font-semibold text-foreground">₹{property.deposit_amount.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary">Maintenance</span>
                 <span className="font-semibold text-foreground">
                   {property.maintenance_included ? 'Included' : `₹${property.maintenance_amount.toLocaleString('en-IN')}`}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-text-secondary">Available From</span>
                 <span className="font-semibold text-foreground">
                   {property.available_from ? new Date(property.available_from).toLocaleDateString() : 'Immediately'}
                 </span>
               </div>
             </div>

             <div className="mb-8 bg-background p-4 rounded-xl border border-border">
               <h3 className="font-semibold text-sm text-text-secondary uppercase tracking-wider mb-2">Listed by</h3>
               <div className="text-foreground font-bold text-lg">{property.host?.first_name} {property.host?.last_name}</div>
               <div className="text-sm text-text-muted mt-1">Member since {new Date(property.host?.created_at).getFullYear()}</div>
             </div>

             {user ? (
               <>
                 <EnquiryForm propertyId={property.id} />
                 <ReportButton propertyId={property.id} />
               </>
             ) : (
               <>
                 <a href="/login" className="flex items-center justify-center w-full bg-primary text-white py-3.5 rounded-[10px] font-medium hover:bg-primary-hover transition-colors shadow-sm">
                   Log in to Contact Host
                 </a>
                 <div className="text-center mt-4">
                   <a href="/login" className="text-sm text-text-muted hover:text-error transition-colors">
                     Report this listing
                   </a>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    </main>
  );
}
