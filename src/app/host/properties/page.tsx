import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

export default async function HostProperties() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Properties</h1>
        <Link 
          href="/host/properties/create" 
          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-hover"
        >
          Add New Property
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(!properties || properties.length === 0) ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            You haven&apos;t added any properties yet.
          </div>
        ) : (
          properties.map((property: Property) => (
            <Card key={property.id} className="overflow-hidden flex flex-col">
              <div className="bg-secondary h-48 w-full flex items-center justify-center text-gray-400">
                [Image Placeholder]
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold truncate">{property.title}</h3>
                <p className="text-sm text-gray-500 mb-2 truncate">{property.locality}, {property.city}</p>
                <div className="flex gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    property.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    property.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                    property.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {property.status}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    property.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                    property.verification_status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {property.verification_status}
                  </span>
                </div>
                <div className="mt-auto pt-4 flex gap-2 border-t">
                  <Link 
                    href={`/host/properties/${property.id}/edit`}
                    className="text-sm font-medium text-primary hover:underline flex-1 text-center"
                  >
                    Edit
                  </Link>
                  <form action={`/host/actions/deleteProperty`} method="POST" className="flex-1">
                    <input type="hidden" name="property_id" value={property.id} />
                    <button type="submit" className="text-sm font-medium text-red-600 hover:underline w-full text-center">
                      Delete
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
