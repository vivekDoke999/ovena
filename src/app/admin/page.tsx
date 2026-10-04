import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  
  const [{ count: pendingCount }, { count: usersCount }, { count: reportsCount }] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('verification_status', 'PENDING'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['OPEN', 'INVESTIGATING'])
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingCount || 0}</div>
            <Link href="/admin/properties" className="text-sm text-primary hover:underline mt-2 inline-block">
              Review Properties &rarr;
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
            <Link href="/admin/users" className="text-sm text-primary hover:underline mt-2 inline-block">
              Manage Users &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reportsCount || 0}</div>
            <Link href="/admin/reports" className="text-sm text-primary hover:underline mt-2 inline-block">
              View Reports &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
