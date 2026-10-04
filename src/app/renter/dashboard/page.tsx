import { createClient } from '@/lib/supabase/server';
import PropertyCard from '@/components/properties/PropertyCard';
import Link from 'next/link';

export default async function RenterDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const params = await searchParams;
  const tab = params.tab || 'saved';

  if (!user) return null; // Handled by layout

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  let content = null;

  if (tab === 'saved') {
    const { data: savedProps } = await (supabase
      .from('saved_properties')
      .select(`
        properties (
          *,
          property_images (image_url)
        )
      `)
      .eq('renter_id', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .order('created_at', { ascending: false }) as any);

    const signedUrlMap: Record<string, string> = {};
    if (savedProps && savedProps.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const imagePaths = savedProps.map((sp: any) => sp.properties?.property_images?.[0]?.image_url).filter(Boolean);
      if (imagePaths.length > 0) {
        const { data } = await supabase.storage.from('property-images').createSignedUrls(imagePaths, 3600);
        if (data) {
          data.forEach((item) => {
            if (item.signedUrl && item.path) signedUrlMap[item.path] = item.signedUrl;
          });
        }
      }
    }

    content = (
      <div>
        <h2 className="text-2xl font-bold mb-6">Saved Properties</h2>
        {(!savedProps || savedProps.length === 0) ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No saved properties</h3>
            <p className="text-gray-500 mb-4">You haven&apos;t saved any properties yet.</p>
            <Link href="/search" className="text-primary font-medium hover:underline">Start exploring &rarr;</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {savedProps.map((sp: any) => {
              const property = sp.properties;
              if (!property) return null;
              
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
        )}
      </div>
    );
  } else if (tab === 'enquiries') {
    const { data: enquiries } = await (supabase
      .from('enquiries')
      .select(`
        *,
        properties (
          id, title, city, locality
        )
      `)
      .eq('renter_id', user.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .order('created_at', { ascending: false }) as any);

    content = (
      <div>
        <h2 className="text-2xl font-bold mb-6">My Enquiries</h2>
        {(!enquiries || enquiries.length === 0) ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No enquiries yet</h3>
            <p className="text-gray-500">You haven&apos;t made any enquiries yet. Reach out to hosts to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {enquiries.map((enq: any) => (
              <div key={enq.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
                <div>
                  <div className="flex gap-2 items-center mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      enq.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      enq.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      enq.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enq.status}
                    </span>
                    <span className="text-sm text-gray-500">{new Date(enq.created_at).toLocaleDateString()}</span>
                  </div>
                  {enq.properties && (
                    <>
                      <Link href={`/property/${enq.properties.id}`} className="text-lg font-bold hover:text-primary transition-colors block mb-1">
                        {enq.properties.title}
                      </Link>
                      <p className="text-sm text-gray-500 mb-4">{enq.properties.locality}, {enq.properties.city}</p>
                    </>
                  )}
                  
                  <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 italic border-l-4 border-gray-300">
                    &quot;{enq.message}&quot;
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (tab === 'profile') {
    content = (
      <div>
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">First Name</label>
            <div className="text-lg">{profile?.first_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Last Name</label>
            <div className="text-lg">{profile?.last_name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email (via Auth)</label>
            <div className="text-lg">{user.email}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col gap-2">
          <Link 
            href="/renter/dashboard?tab=saved" 
            className={`px-4 py-3 rounded-lg font-medium transition ${tab === 'saved' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            Saved Properties
          </Link>
          <Link 
            href="/renter/dashboard?tab=enquiries" 
            className={`px-4 py-3 rounded-lg font-medium transition ${tab === 'enquiries' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            My Enquiries
          </Link>
          <Link 
            href="/renter/dashboard?tab=profile" 
            className={`px-4 py-3 rounded-lg font-medium transition ${tab === 'profile' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            Profile
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {content}
      </div>
    </div>
  );
}
