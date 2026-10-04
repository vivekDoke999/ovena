import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui';
import AdminPropertyActions from '@/components/admin/AdminPropertyActions';
import { Database } from '@/types/database.types';

type Property = Database['public']['Tables']['properties']['Row'];

export default async function AdminProperties() {
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Properties</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(!properties || properties.length === 0) ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No properties found.
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
                <div className="text-sm font-medium mb-4">
                  Rent: ₹{property.rent_amount} | Status: {property.status} | {property.verification_status}
                </div>
                <AdminPropertyActions property={property} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

