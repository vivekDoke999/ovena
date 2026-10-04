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
    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
              {property.property_type}
            </span>
            {property.verification_status === 'VERIFIED' && (
               <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                 ✓ Verified
               </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{property.title}</h1>
          <p className="text-gray-500 text-lg">{property.locality}, {property.city}, {property.state} {property.zip_code}</p>
        </div>
        <div className="flex items-center gap-3">
           {user ? (
              <SaveButton propertyId={property.id} initialSaved={isSaved} />
           ) : (
             <a href="/login" className="px-4 py-2 rounded-md font-medium border bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
               Log in to Save
             </a>
           )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-8 h-[50vh] min-h-[400px] rounded-xl overflow-hidden">
         {images.length > 0 ? (
           <>
             <div className="md:col-span-2 md:row-span-2 relative bg-gray-100">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={images[0]} alt="Property Primary" className="w-full h-full object-cover" />
             </div>
             {images.slice(1, 5).map((src, idx) => (
               <div key={idx} className="relative bg-gray-100 hidden md:block">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={src} alt={`Property ${idx+2}`} className="w-full h-full object-cover" />
               </div>
             ))}
           </>
         ) : (
           <div className="col-span-full flex items-center justify-center bg-gray-100 text-gray-400">
             No images available
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="flex flex-wrap gap-6 py-6 border-y border-gray-200">
             {property.bedrooms !== null && (
               <div className="flex flex-col">
                 <span className="text-gray-500 text-sm">Bedrooms</span>
                 <span className="font-bold text-lg">{property.bedrooms}</span>
               </div>
             )}
             {property.bathrooms !== null && (
               <div className="flex flex-col border-l pl-6 border-gray-200">
                 <span className="text-gray-500 text-sm">Bathrooms</span>
                 <span className="font-bold text-lg">{property.bathrooms}</span>
               </div>
             )}
             {property.area_sqft !== null && (
               <div className="flex flex-col border-l pl-6 border-gray-200">
                 <span className="text-gray-500 text-sm">Area</span>
                 <span className="font-bold text-lg">{property.area_sqft} <span className="text-sm font-normal">sqft</span></span>
               </div>
             )}
             {property.furnishing_status && (
               <div className="flex flex-col border-l pl-6 border-gray-200">
                 <span className="text-gray-500 text-sm">Furnishing</span>
                 <span className="font-bold text-lg">{property.furnishing_status.replace('_', ' ')}</span>
               </div>
             )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">About this property</h2>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {property.description}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {amenities.map((amenity: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="text-primary">•</span> {amenity}
                </div>
              ))}
              {amenities.length === 0 && <div className="text-gray-500">Not specified</div>}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="relative">
          <div className="sticky top-24 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <div className="mb-6">
               <span className="text-3xl font-bold text-gray-900">₹{property.rent_amount.toLocaleString('en-IN')}</span>
               <span className="text-gray-500"> / month</span>
             </div>
             
             <div className="space-y-3 mb-6 text-sm text-gray-600 border-y border-gray-100 py-4">
               <div className="flex justify-between">
                 <span>Security Deposit</span>
                 <span className="font-medium text-gray-900">₹{property.deposit_amount.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between">
                 <span>Maintenance</span>
                 <span className="font-medium text-gray-900">
                   {property.maintenance_included ? 'Included' : `₹${property.maintenance_amount.toLocaleString('en-IN')}`}
                 </span>
               </div>
               <div className="flex justify-between">
                 <span>Available From</span>
                 <span className="font-medium text-gray-900">
                   {property.available_from ? new Date(property.available_from).toLocaleDateString() : 'Immediately'}
                 </span>
               </div>
             </div>

             <div className="mb-6">
               <h3 className="font-medium mb-1">Listed by</h3>
               <div className="text-gray-900 font-bold">{property.host?.first_name} {property.host?.last_name}</div>
               <div className="text-sm text-gray-500">Member since {new Date(property.host?.created_at).getFullYear()}</div>
             </div>

             {user ? (
               <>
                 <EnquiryForm propertyId={property.id} />
                 <ReportButton propertyId={property.id} />
               </>
             ) : (
               <>
                 <a href="/login" className="block text-center w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary-hover transition">
                   Log in to Contact Host
                 </a>
                 <div className="text-center mt-4">
                   <a href="/login" className="text-sm text-gray-500 hover:text-red-600 underline underline-offset-2 transition-colors">
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
