import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import Link from 'next/link';

export default async function HostDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch host's properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('host_id', user.id);

  const stats = {
    total: properties?.length || 0,
    active: properties?.filter(p => p.status === 'AVAILABLE' && p.verification_status === 'VERIFIED').length || 0,
    pending: properties?.filter(p => p.verification_status === 'PENDING').length || 0,
  };

  // Fetch enquiries count for these properties
  let enquiriesCount = 0;
  if (properties && properties.length > 0) {
    const propertyIds = properties.map(p => p.id);
    const { count } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true })
      .in('property_id', propertyIds);
    enquiriesCount = count || 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Host Dashboard</h1>
        <Link 
          href="/host/properties/create" 
          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-hover"
        >
          Add New Property
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active (Verified)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{enquiriesCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/host/properties" className="text-primary hover:underline font-medium">
          Manage Properties &rarr;
        </Link>
      </div>
    </div>
  );
}
